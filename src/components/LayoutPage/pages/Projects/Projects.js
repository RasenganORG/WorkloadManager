import { Breadcrumb, Layout, Col, Row, Card, Progress, Button, List, badge, Badge } from 'antd';
import { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from '../../../Spinner';
import { getProjects, reset } from '../../../../features/projects/projectsSlice';

export default function Projects() {
	const { projectList, isLoading, isError, isSuccess, message } = useSelector(
		(state) => state.projects
	)
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(getProjects())
	}, [])

	const generateProjectCard = (project, iterationId) => {
		const { id, title, description, tasks, status } = project
		const projectTasksData = [
			{
				title: "Upcoming tasks",
				taskNumber: tasks.length,
			},
			{
				title: "Assigned tasks",
				taskNumber: 0,
			},
			{
				title: "Blocked tasks",
				taskNumber: 0,
			}

		];

		return (
			<Col key={id} span={8}>
				<Badge.Ribbon text={status} color="green">
					<Card title={ <Link to={id}>{title}</Link>} bordered={false}>
						<p>{description}</p>
						<Row gutter={4}>
							<Col span={12}>
								<h3>Statistics</h3>
								<List
									itemLayout="horizontal"
									dataSource={projectTasksData}
									renderItem={(item) => (
										<List.Item>
											<List.Item.Meta
												title={<a href="#">{item.title + ": " + item.taskNumber}</a>}
											/>
										</List.Item>
									)}
								/>
							</Col>
							<Col span={12} style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							}}>
								<Progress type="circle" percent={55} />
							</Col>
						</Row>
					</Card>
				</Badge.Ribbon>
			</Col>
		)
	}

	if (isLoading) {
		return <Spinner />
	}

	return (
		<Layout
			style={{
				padding: '0 24px 24px',
			}}
		>
			<Row justify='space-between' align='middle'>
				<Breadcrumb
					style={{
						margin: '16px 0 ',
					}}
				>
					<Breadcrumb.Item>Home</Breadcrumb.Item>
					<Breadcrumb.Item>Projects</Breadcrumb.Item>
				</Breadcrumb>

				<Button type="primary">
					<Link to="add-project">
						Add new project
					</Link>
				</Button>
			</Row>
			<Row gutter={[16, 16]} >
				{projectList ? projectList.map((project, iterationId) => {
					{ return generateProjectCard(project, iterationId) }
				}) : 'No projects added yet'}
			</Row>
			<Outlet />
		</Layout>
	)
}
