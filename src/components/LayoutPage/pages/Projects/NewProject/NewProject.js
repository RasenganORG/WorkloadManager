import { Layout, Card, Form, Input, Button, Select, DatePicker } from "antd"
import TextArea from "antd/lib/input/TextArea"
import { useState } from "react"
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { addProject } from "../../../../../features/projects/projectsSlice"

export default function NewProject() {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		usersAssigned: [],
		creationDate: '',
		dueDate: '',
		colorLabel: 'none',
		billingOption: '',
		status: 'active',
		tasks: []
	})

	const navigate = useNavigate()
	const dispatch = useDispatch()

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

	const onSubmit = () => {
		dispatch(addProject(formData))
		navigate('/')
	}

	return (
		<Layout>
			<Layout.Content style={{ margin: "16px 0" }}>
				<Card title="Create a new project">
					<Form
						layout="vertical"
						onFinish={() => onSubmit()}
					>

						<Form.Item
							name="titleWrapper"
							label="Project title"
							rules={[
								{
									required: true,
									message: 'Please input the title of your project!',
								},
							]}
							data-cy="projectTitle"
						>
							<Input
								name='title'
								placeholder="Title"
								onChange={(onInputChange)}
							/>
						</Form.Item>
						<Form.Item
							name="descriptionWrapper"
							label="Project description"
							rules={[
								{
									required: true,
									message: 'Please add a project description!'
								}
							]}
							data-cy="projectDescription"
						>
							<TextArea
								name='description'
								rows={4}
								placeholder="Description"
								onChange={onInputChange}
							/>
						</Form.Item>
						<Form.Item
							label="Add users"
							name="usersAssignedWrapper"
							rules={[
								{
									required: true,
									message: 'Please add at lease one user to your project!',
								},
							]}
							data-cy="addUsers"
						>
							<Select
								mode="multiple"
								name="usersAssigned"
								onChange={(value) => {
									onSelectChange(value, 'usersAssigned')
								}}
							>
								<Select.Option value="user0">John Doe 0</Select.Option>
								<Select.Option value="user1">John Doe 1</Select.Option>
								<Select.Option value="user2">John Doe 2</Select.Option>
								<Select.Option value="user3">John Doe 3</Select.Option>
								<Select.Option value="user4">John Doe 4</Select.Option>
							</Select>

						</Form.Item>

						<Form.Item
							label="Due date"
							name="dueDateWrapper"
							rules={[
								{
									required: true,
									message: 'Please add a due date for your project!'
								}
							]}
							data-cy="dueDateSelector"

						>
							<DatePicker
								name='dueDate'
								style={{ width: '100%' }}
								onChange={(value) => {
									onSelectChange(value.toDate(), 'dueDate')
								}}
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
								defaultValue="none"
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
							name="billingSelectorWrapper"
							rules={[
								{
									required: true,
									message: 'Please select a billing option!',
								},
							]}
							data-cy="billingSelector"
						>
							<Select
								placeholder="Select a billing option"
								name='billingOption'
								onChange={(value) => {
									onSelectChange(value, 'billingOption')
								}}
							>
								<Select.Option value="1">Billing 1</Select.Option>
								<Select.Option value="2">Billing 2</Select.Option>
								<Select.Option value="3">Billing 3</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item data-cy="newProjectSubmitButton" >
							<Button type="primary" htmlType="submit">Create project</Button>
						</Form.Item>
					</Form>
				</Card>
			</Layout.Content>
		</Layout>
	)
}
