import "./Login.scss"
import "antd/dist/antd.css";
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";



export default function Login() {
	const test = () => {
		alert("yea idk that sounds like a you problem")
	}
	return (
		<div className="LoginPage">
			<Form name="normal_login" className="login-form">
				<Form.Item>
					<h2>Log in</h2>
				</Form.Item>
				<Form.Item
					name="username"
					rules={[
						{
							required: true,
							message: 'Please input your Username!',
						},
					]}
					data-cy="usernameInput"
 				>
					<Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" size="large" />

				</Form.Item>

				<Form.Item
					name="password"
					rules={[
						{
							required: true,
							message: 'Please input your Password!',
						},
					]}
					data-cy="passwordInput"

				>
					<Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" size="large" />
				</Form.Item>
				<Form.Item>
					<a className="login-form-forgot" href="" onClick={test}>
						Forgot password?
					</a>
				</Form.Item>

				<Form.Item data-cy="loginSubmitButton">
					<Button type="primary" htmlType="submit" className="login-form-button" size="large">
						Log in
					</Button>
					<p>Don't have an account? <Link to="../register"> <a href="">Register now</a> </Link></p>

				</Form.Item>
			</Form>
		</div>
	)
}