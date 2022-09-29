import React from 'react'
import { Layout, Row, Col, Card, Select, Modal, DatePicker } from 'antd'
import HighchartsReact from "highcharts-react-official";
import Highcharts, { format } from 'highcharts'
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { getAllUsers } from '../../../../features/users/userSlice';
import { getAllTasks } from '../../../../features/tasks/tasksSlice';
import { getAllSprints } from '../../../../features/sprint/sprintSlice';
import { getAllUserProjectEntries } from '../../../../features/userProject/userProjectSlice';

export default function Statistics() {
  const dispatch = useDispatch()
  const [customTimePeriod, setCustomTimePeriod] = useState({
    startDate: moment(),
    endDate: moment()
  })
  const [timePeriodType, setTimePeriodType] = useState('predefinedTime')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [displayedTimePeriod, setDisplayedTimePeriod] = useState('currentWeek')
  const { userList } = useSelector(state => state.users)
  const { tasks } = useSelector(state => state.tasks)
  const { sprints } = useSelector(state => state.sprint)
  const { userProjectEntries } = useSelector(state => state.userProjectEntries)
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers())
    dispatch(getAllUserProjectEntries())
    dispatch(getAllTasks())
    dispatch(getAllSprints())
  }, [])

  useEffect(() => {
    if (userList) {
      if (selectedUsers.length === 0) {
        //we select the 3 first users by default
        const defaultSelectedUsers = []
        userList.slice(0, 3)?.forEach(user => defaultSelectedUsers.push(user.id))
        setSelectedUsers(defaultSelectedUsers)
      }
    }
  }, [userList])

  const chartTimePeriodModal = {
    showModal: () => {
      setIsModalOpen(true);
    },
    handleOk: () => {
      setIsModalOpen(false);
    },
    handleCancel: () => {
      setIsModalOpen(false);
    },
    onDateRangeChange: (value) => {
      console.log(value)
    }
  }

  const getTimePeriod = () => {
    //returns an array containing the time period in Date.UTC format, format that is used by Highcharts
    const timePeriod = [];

    if (timePeriodType === 'predefinedTime') {
      const currentDate = new Date()

      let selectedTimePeriod = {
        days: 7,
        displayFutureDates: true,
      };

      switch (displayedTimePeriod) {
        case 'currentWeek':
          selectedTimePeriod = {
            days: 7,
            displayFutureDates: true
          };
          break;

        case 'currentMonth':
          selectedTimePeriod = {
            days: 30,
            displayFutureDates: true
          };
          break;
        case 'pastWeek':
          selectedTimePeriod = {
            days: 7,
            displayFutureDates: false
          };
          break;
        case 'pastMonth':
          selectedTimePeriod = {
            days: 30,
            displayFutureDates: false
          };
          break;

      }
      //we use an array contructor to iterara a number of $days times and generate the requested date
      [...Array(selectedTimePeriod.days)].forEach((_, i) => {
        const day = selectedTimePeriod.displayFutureDates ? currentDate.getUTCDate() + i : currentDate.getUTCDate() - i;

        const utcDate = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(),
          day);
        timePeriod.push(utcDate)
      });

    } else {
      const { startDate, endDate } = customTimePeriod;
      const rangeDaysDuration = moment(endDate).diff(moment(startDate), 'days');

      [...Array(rangeDaysDuration + 1)].forEach((_, index) => {
        const day = moment(new Date(moment(startDate)).getUTCDate() + index)
        const utcDate = Date.UTC(new Date(moment(startDate)).getUTCFullYear(), new Date(moment(startDate)).getUTCMonth(), day);
        timePeriod.push(utcDate)
      })
    }

    return timePeriod
  }
  const getSelectedUsers = () => {
    const usersArr = []
    selectedUsers.forEach(selectedUserId => {
      const user = userList.find(user => user.id === selectedUserId)
      const projectsAssignedTo = userProjectEntries.filter(userProject => userProject.userId === selectedUserId)
      const userObj = {
        name: user.name,
        id: user.id,
        projects: projectsAssignedTo
      }
      usersArr.push(userObj)
    })
    return usersArr
  }
  const getActiveSprints = () => {
    const { startDate, endDate } = customTimePeriod
    const activeSprintsArr = []
    sprints?.forEach(sprint => {
      if (moment(sprint.startDate).isSameOrAfter(startDate, 'day') && moment(sprint.endDate).isSameOrBefore(endDate, 'day')) {
        activeSprintsArr.push(sprint)
      }
    })
    return activeSprintsArr
  }

  const getUserTasksByProject = () => {
    const newUsersArr = [];
    const users = [...getSelectedUsers()]
    const activeSprints = getActiveSprints()
    const isTaskValid = (task, project, user) => {
      if (
        task.projectId === project.projectId &&
        task.asigneeId === user.id &&
        task.taskData.queue !== 'Blocked' &&
        task.taskData.queue !== 'Completed' &&
        activeSprints.find(sprint => sprint.sprintId === task.taskData.sprintId)
      ) {
        return true
      }
    }
    users?.forEach((user, userIndex) => {
      //created a deep copy of the userObject, if we were to create a shallow copy we would be unable to edit/add keys
      const newUser = JSON.parse(JSON.stringify(user))
      user.projects.forEach((project, projectIndex) => {
        // newUser.projects[projectIndex].text = `Bine boss, asta e proj index ${projectIndex}`
        const projectTasks = tasks.filter(task => isTaskValid(task, project, user))

        newUser.projects[projectIndex].tasks = projectTasks

      })
      newUsersArr.push(newUser)
    })
    return newUsersArr
  }
  const generateNewData = () => {
    const series = []
    const timePeriod = getTimePeriod() //array of UTC data, as selected by the users
    const userTasksbyProject = getUserTasksByProject() //array of objecst, containing the user name/id, the projects that they are assigned to and the eligible tasks assigned to them from sprints within the range selected
    const getTotalWorkingTimePerPrject = (tasks) => {
      //function that takes projects tasks as a parameter and returns the sum of all task estimates in hours
      const totalProjectHours = tasks.reduce(
        (accumulator, task) => accumulator + parseInt(task.taskData.timeEstimate), 0
      )
      return totalProjectHours
    }

    userTasksbyProject.forEach(userTaskProject => {
      const userStatistic = {
        name: userTaskProject.name,
        data: []
      }
      let userWorkloadPerProject = userTaskProject.projects.map(project => ({
        projectId: project.id,
        availability: project.availability,
        estimatedWorkloadDuration: getTotalWorkingTimePerPrject(project.tasks)
      }))
      timePeriod?.forEach(day => {
        const isFutureDate = moment().subtract(1, 'days').isBefore(day) //we check if the iterated date is before the currentDate or not

        if (isFutureDate) {
          let dailyTime = 0;

          userWorkloadPerProject.forEach((project, index) => {
            //we iterate over each of user's projects, check the total time duration and add the daily hours depending on their availability per project
            //for ex, if a project total duration is 5 hours but user is assigned 4 hours to that project project, for the day we would add 4 hours, 
            //and then we would substract 4 hours from the project duration so that the next day we have 1 hours left to display
            if (project.estimatedWorkloadDuration >= project.availability) {
              dailyTime += parseInt(project.availability)
              userWorkloadPerProject[index].estimatedWorkloadDuration -= project.availability
            } else {
              dailyTime += project.estimatedWorkloadDuration
              if (project.estimatedWorkloadDuration - project.estimatedWorkloadDuration < 0) {
                userWorkloadPerProject[index].estimatedWorkloadDuration = 0
              } else {
                userWorkloadPerProject[index].estimatedWorkloadDuration -= project.estimatedWorkloadDuration
              }

            }
          })
          userStatistic.data.push([day, dailyTime])
        } else {
          userStatistic.data.push([day, 0])
        }
      })
      series.push(userStatistic)
    })

    return series
  }

  const chartDefaultValue = {
    chart: {
      type: 'area'
    },
    title: {
      text: 'User availability'
    },
    subtitle: {
      text: 'visualise the user workload'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        year: '%b',
        day: ' %e %b'
      },
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Assigned work (hours) '
      },
      min: 0
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.x:%e. %b}: {point.y:.2f} hours'
    },

    plotOptions: {
      column: {
        stacking: true
      },
      series: {
        marker: {
          enabled: true,
          radius: 2.5
        }
      }
    },
    colors: ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7"],
    series: generateNewData()
  }
  const handleUserSelection = (value) => {
    setSelectedUsers(value);
  };
  const handlePeriodChange = (value) => {
    if (timePeriodType === 'predefinedTime') {
      setDisplayedTimePeriod(value)
    } else {

    }

  };

  const onTimePeriodChange = (e) => {
    setTimePeriodType(e)
  }
  const onCustomRangeChange = (value) => {
    setCustomTimePeriod({
      startDate: value[0],
      endDate: value[1]
    })
  }

  return (
    <Layout
      style={{
        padding: '0 24px 24px',
      }}
    >
      <Card style={{ textAlign: 'left' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartDefaultValue}
        />
        <Row style={{ fontWeight: 'bold' }} align="bottom">
          <Col span={18}>
            <p>Users to display</p>
            <Select
              mode="multiple"
              allowClear
              style={{
                width: '100%',
              }}
              placeholder="Please select"
              value={selectedUsers}
              onChange={handleUserSelection}
            >
              {userList?.map((user, index) => {
                return <Select.Option key={index} value={user.id}>{user.name}</Select.Option>
              })}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p>Time period:</p>
              <Select defaultValue="predefinedTime" style={{ width: '50%' }} onChange={onTimePeriodChange}>
                <Select.Option value="predefinedTime">Predefined time</Select.Option>
                <Select.Option value="custom">Custom</Select.Option>
              </Select>
            </div>
            {timePeriodType === 'predefinedTime' ?
              <Select defaultValue="currentWeek" style={{ width: '100%' }} onChange={handlePeriodChange}>
                <Select.Option value="currentWeek">Current Week</Select.Option>
                <Select.Option value="currentMonth">Current Month</Select.Option>
                <Select.Option value="pastWeek" >Past week</Select.Option>
                <Select.Option value="pastMonth">Past Month</Select.Option>
                {/* <Select.Option value="custom">Custom time</Select.Option> */}
              </Select>
              :
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                allowClear={false}
                defaultValue={[moment(), '']}
                format={"DD/MM/YYYY"}
                onChange={(value) => { onCustomRangeChange(value) }}
              />
            }


          </Col>
        </Row>
        <Modal title="Select custom period" visible={isModalOpen} onOk={chartTimePeriodModal.handleOk} onCancel={chartTimePeriodModal.handleCancel}>
          < DatePicker.RangePicker
            style={{ width: '100%' }}
            allowClear={false}
            defaultValue={[moment(), '']}
            format={"DD/MM/YYYY"}
            onChange={(value) => { chartTimePeriodModal.onDateRangeChange(value) }}
          />
        </Modal>
      </Card>
    </Layout >
  )
}
