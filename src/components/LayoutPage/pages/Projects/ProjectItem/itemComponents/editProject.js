import { Layout, Card, Form, Input, Button, Select, DatePicker, Popconfirm, List, Modal } from "antd"
import TextArea from "antd/lib/input/TextArea"
import { CloseOutlined } from '@ant-design/icons';

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import { updateProject, deleteProject } from "../../../../../../features/projects/projectsSlice"
import { getBillingOptions } from "../../../../../../features/billing/billingSlice"
import { deleteProjectTasks, removeUsersFromTasks } from "../../../../../../features/tasks/tasksSlice"
import { toast } from "react-toastify";
import moment from "moment"
import { updateUser, updateUsersProject } from "../../../../../../features/users/userSlice"
import { getProjectUsers } from "../../../../../../features/userProject/userProjectSlice";

export default function EditProject() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()
  const currentProject = useSelector((state) => state.projects.currentProject.project)
  const { title, description, estimatedWorkingTime, usersAssigned, status, colorLabel, billingOption } = currentProject
  const { userProjectEntries, isLoading } = useSelector(state => state.userProjectEntries)
  const [usersToAdd, setUsersToAdd] = useState([])
  const [usersToRemove, setUsersToRemove] = useState([])
  const [assignedUsers, setAssignedUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    userId: '',
    availability: '',
    projectId: '',
  })
  const [formData, setFormData] = useState({
    title: title,
    description: description,
    estimatedWorkingTime: estimatedWorkingTime,
    colorLabel: colorLabel,
    billingOption: billingOption,
    status: status,
  })

  const [dispatchUpdates, setDispatchUpdates] = useState(false)
  const { userList } = useSelector(state => state.users)
  const billing = useSelector(state => state.billing)
  //returns an arr with the user ids that were removed from the project

  //returns an arr with the user ids that were added to the project
  const getAddedUsers = () => {
    return formData.usersAssigned.filter(x => !usersAssigned.includes(x))
  }
  //take
  const updatedTasksWithRemovedUsers = (removedUsers) => {
    const updatedTasks = formData.tasks ? [...formData.tasks] : []
    removedUsers.forEach((removedUser) => {
      formData.tasks?.forEach((task, index) => {
        if (removedUser === task.asignee) {
          const newTask = { ...updatedTasks[index] }
          newTask.asignee = ''
          updatedTasks.splice(index, 1, newTask)
        }
      })
    })
    return updatedTasks
  }
  // const usersToUpdate = () => {
  //   return {
  //     usersToAddProject: getAddedUsers(),
  //     // usersToRemoveProject: getRemovedUsers()
  //   }
  // }
  const onInputChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSelectChange = (value, inputName) => {
    setFormData((prevState) => ({
      ...prevState,
      [inputName]: value
    }))
  }

  const onDateRangeChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      estimatedWorkingTime: {
        start: value[0],
        end: value[1]
      }
    }))
  }

  const handleUserDelete = (userId) => {
    const updatedArray = [...assignedUsers]
    const usersToRemoveArray = [...usersToRemove]
    const indexToRemove = assignedUsers.findIndex(user => user.userId === userId)
    usersToRemoveArray.push(updatedArray[indexToRemove])
    console.log()
    setUsersToRemove(usersToRemoveArray)

    updatedArray.splice(indexToRemove, 1)

    setAssignedUsers(updatedArray)
    console.log(usersToRemove)
  }
  const onSubmit = () => {

    // if (formData.usersAssigned !== currentProject.usersAssigned) {
    //   setFormData((prevState) => ({
    //     ...prevState,
    //     tasks: updatedTasksWithRemovedUsers(getRemovedUsers())
    //   }))

    // }
    setDispatchUpdates(true)
  }
  const handleDelete = () => {
    dispatch(deleteProject(params.projectId))
    dispatch(deleteProjectTasks(params.projectId))
    dispatch(updateUsersProject({ data: { usersToAddProject: [], usersToRemoveProject: usersAssigned }, projectId: params.projectId }))
    navigate('/')
  }

  const userModal = {
    showModal: () => {
      setIsUserModalOpen(true);
    },
    handleOk: () => {
      if (newUser.userId && newUser.availability) {
        const newUserArr = [...assignedUsers];
        const usersToAddArray = [...usersToAdd];
        newUserArr.push(newUser)
        usersToAddArray.push(newUser)
        setAssignedUsers(newUserArr)
        setUsersToAdd(usersToAddArray)
        userModal.resetCurrentUser()
        setIsUserModalOpen(false);

      } else {
        toast.error("Please complete all fields")
      }
    },
    handleCancel: () => {
      setIsUserModalOpen(false)
      userModal.resetCurrentUser()
    },
    onChange: (value, inputName) => {
      setNewUser((prevState) => ({
        ...prevState,
        [inputName]: value
      }))
    },
    resetCurrentUser: () => {
      setNewUser({ userId: '', availability: '' })
    },
    handleUserRemoval: (userId) => {
      console.log(userId)
      const newArray = [...assignedUsers]
      const indexToRemove = newArray.findIndex(user => user.userId === userId)
      newArray.splice(indexToRemove, 1)
      setAssignedUsers(newArray)
      console.log(newArray)
    }


  }
  const generateUserSelect = () => {

    const wasUserSelected = (userId) => {
      const found = assignedUsers?.find(user => user.userId === userId)
      return found
    }

    const generateSelect = (key, userId, userName) => {
      if (wasUserSelected(userId)) {
        return (
          <Select.Option disabled key={key} value={userId}>{userName}</Select.Option>
        )
      } else {
        return (
          <Select.Option key={key} value={userId}>{userName} </Select.Option>
        )
      }

    }
    return (
      <Select
        name="usersAssigned"
        placeholder="User"
        onChange={(value) => {
          userModal.onChange(value, 'userId')
        }}
        style={{ width: '100%' }}
        value={newUser.userId}
      >
        {userList ? userList.map((user, index) => {
          return generateSelect(index, user.id, user.name)
        }) : ''}
      </Select>
    )
  }

  useEffect(() => {
    dispatch(getBillingOptions())
    dispatch(getProjectUsers(params.projectId)).then(setAssignedUsers(userProjectEntries))
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const newArray = []
      assignedUsers?.forEach(assignedUser => {
        const fullUser = userList?.find(user => user.id === assignedUser.userId)
        if (fullUser) {
          newArray.push({ ...fullUser, availability: assignedUser.availability })
        }
      })
      setFilteredUsers(newArray)
    }


    if (dispatchUpdates) {
      dispatch(updateProject({ projectData: formData, projectId: params.projectId }))
      // dispatch(removeUsersFromTasks({ usersArr: getRemovedUsers(), projectId: params.projectId }))
      // dispatch(updateUsersProject({ data: { ...usersToUpdate() }, projectId: params.projectId }))
      navigate('/')

      setDispatchUpdates(false)

    }
  }, [dispatchUpdates, filteredUsers, assignedUsers, userProjectEntries])

  return (
    <Layout>
      <button onClick={() => { console.log('toRemove:', usersToRemove); console.log('to add:', usersToAdd) }}> ttttest</button>

      <Layout.Content style={{ margin: "16px 0" }}>
        <Card title={'Update project'}>
          <Form
            layout="vertical"
            onFinish={() => onSubmit()}
            style={{ textAlign: 'left' }}
          >

            <Form.Item
              label="Project title"
              data-cy="projectTitle"
            >
              <Input
                name='title'
                onChange={(onInputChange)}
                value={formData.title}
              />
            </Form.Item>
            <Form.Item
              label="Project description"
              data-cy="projectDescription"
            >
              <TextArea
                name='description'
                rows={4}
                value={formData.description}
                onChange={onInputChange}
              />
            </Form.Item>

            <Form.Item label="Update users">
              <List
                bordered
                dataSource={filteredUsers}
                renderItem={(user) => (
                  <List.Item >
                    <p>{user.name}</p>
                    <p><b>availability</b>: {user.availability} hours <CloseOutlined onClick={() => handleUserDelete(user.id)} style={{ cursor: "pointer" }} /></p>
                  </List.Item>
                )}
              />
              <Button style={{ margin: '1em 0' }} type="primary" onClick={() => userModal.showModal()}>Add user</Button>

              <Modal title="Add user" visible={isUserModalOpen} onOk={userModal.handleOk} onCancel={userModal.handleCancel}>
                <Form layout='vertical'>
                  <Form.Item label="User to be added">
                    {generateUserSelect()}
                  </Form.Item>
                  <Form.Item label="User availability for this project">
                    <Input
                      suffix='hours'
                      style={{
                        width: '100%',
                        appearance: 'textfield !important'
                      }}
                      placeholder="Number of hours"
                      type='number'
                      max={8}
                      min={1}
                      value={newUser.availability}
                      onChange={(e) => userModal.onChange(e.target.value, 'availability')}
                    />
                  </Form.Item>
                </Form>
              </Modal>
            </Form.Item>
            <Form.Item
              label="Estimated working time"
              data-cy="dueDateSelector"
            >
              <DatePicker.RangePicker
                value={[moment(formData.estimatedWorkingTime.start), moment(formData.estimatedWorkingTime.end)]}
                format={"DD/MM/YYYY"}
                onChange={(value) => { onDateRangeChange(value) }}
              />
            </Form.Item>
            <Form.Item
              label="Color label"
              placeholder="Select a color"
              data-cy="colorSelector"
            >
              <Select
                placeholder="Select a color label option"
                name="colorLabel"
                value={formData.colorLabel}
                onChange={(value) => {
                  onSelectChange(value, 'colorLabel')
                }}
              >
                <Select.Option value="none">None</Select.Option>
                <Select.Option value="red">Red</Select.Option>
                <Select.Option value="purple">Purple</Select.Option>
                <Select.Option value="green">Green</Select.Option>
                <Select.Option value="blue">Blue</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Billing"
              data-cy="billingSelector"
            >
              <Select
                value={formData.billingOption}
                name='billingOption'
                onChange={(value) => {
                  onSelectChange(value, 'billingOption')
                }}
              >
                {billing.billingOptions ? billing.billingOptions.map((billingOption, index) => {
                  return <Select.Option key={index} value={billingOption.billing}>{billingOption.billing}</Select.Option>
                }) : ''}
              </Select>
            </Form.Item>
            <Form.Item data-cy="newProjectSubmitButton" >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button type="primary" htmlType="submit">Edit project</Button>
                <Popconfirm
                  title="Are you sure to delete this project?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="danger" >Delete project</Button>
                </Popconfirm>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </Layout.Content>
    </Layout>
  )
}
