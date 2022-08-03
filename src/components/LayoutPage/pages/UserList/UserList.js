import { Breadcrumb, Layout, Collapse, Avatar, Row, Button, List, Divider } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserList() {
	const [userList, setUserList] = useState([])

	useEffect(() => {
		axios.get('http://localhost:8080/api/users')
			.then(response => {
				setUserList(response.data)
			})
	}, [])
	
	const userGenerator = (name, phoneNumber, email, id) => {
		return (
			<Collapse.Panel key={id} header={< p > <Avatar src="https://joeschmoe.io/api/v1/random" /> {name}</p >}>
				<div>
					<Row >
						{name} is assigned to :
						<Button type="primary" size="small" style={{ margin: "0 5px" }}>
							Project 1
						</Button>
						<Button type="primary" size="small" style={{ margin: "0 5px" }}>
							Project 2
						</Button>
						<Button type="primary" size="small" style={{ margin: "0 5px" }}>
							Project 3
						</Button>
					</Row>
					{/* <Divider />
				<h3><b>Task status</b> </h3>
				<p>Tasks assigned: 2</p>
				<p>Tasks completed: 53</p> */}
					<Divider />
					<h3><b>Contact info</b> </h3>
					<p>Phone number: {phoneNumber}</p>
					<p>email: {email}</p>
				</div>
			</Collapse.Panel >
		)
	}

	const collapsePanelPlaceholder = <p> <Avatar src="https://joeschmoe.io/api/v1/random" />  John Doe</p>
	const userInfo = () => {
		return (
			<div>
				<Row >
					John Doe is assigned to :
					<Button type="primary" size="small" style={{ margin: "0 5px" }}>
						Project 1
					</Button>
					<Button type="primary" size="small" style={{ margin: "0 5px" }}>
						Project 2
					</Button>
					<Button type="primary" size="small" style={{ margin: "0 5px" }}>
						Project 3
					</Button>
				</Row>
				<Divider />
				<h3><b>Task status</b> </h3>
				<p>Tasks assigned: 2</p>
				<p>Tasks completed: 53</p>
				<Divider />
				<h3><b>Contact info</b> </h3>
				<p>Phone number: +0123456789</p>
				<p>email: email@example.com</p>

			</div>
		)
	}

	return (
		<Layout style={{ padding: '0 24px 24px' }}>
			<Breadcrumb
				style={{
					margin: '16px 0',
				}}
			>
				<Breadcrumb.Item>Home</Breadcrumb.Item>
				<Breadcrumb.Item>User list</Breadcrumb.Item>
			</Breadcrumb>

			{/* main content start */}
			<Layout className="site-layout-background">
				<Collapse  >
					{userList.map((user, id) => {
						return userGenerator(user.name, user.phoneNumber, user.email, id)
					})}
				</Collapse>
			</Layout>
		</Layout>

	)
}
