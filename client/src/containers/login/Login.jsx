import React, { useState } from 'react';
import logo from './../../assets/logofont.svg';
import {  CtaButton } from '../../components';
import {Link, useNavigate} from 'react-router-dom'
import './login.css';
import { toast, ToastContainer } from 'react-toastify';

const Login = () => {
	// State to manage form data
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const navigate = useNavigate();
	const notify = (msg, type = 'info') => toast[type](msg);
	// Function to handle form submission
	const handleSubmit = async (e) => {
	  e.preventDefault();
  
	  try {
		const formData = {
			email: email,
			password: password
		  };
		  
		  const response = await fetch('/api/signin', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify(formData)
		  });
  
		if (response.ok) {
		  const data = await response.json();
      		localStorage.setItem('token', data.token);
      		localStorage.setItem('user_id', data.user?._id);
      		localStorage.setItem('user_email', data.user?.email);
      		localStorage.setItem('user_name', data.user?.fullName);
			  localStorage.setItem('user_profile_picture', data.user?.profilePicture);
			  notify('Login successful', 'success');

			  setTimeout(() => {
				navigate('/');
			  }, 3000); // Adjust
		} else {
			notify('Email or password is incorrect', 'error');
		}
	  } catch (error) {
		console.error('Error:', error);
	  }
	};
  
  
	return (
		<div className="user-login">
			<ToastContainer />
		<div className="logo">
		<img src='https://www.schneideit.com/wp-content/uploads/2020/12/schneide-logo.svg' alt="schneide-logo" />

		</div>
		<div className="login-form">
			<h1 className="title-heading">User Login</h1>
		  <form onSubmit={handleSubmit}>
			<div className="input-fields">
			  <input
				type="email"
				placeholder="Email ID"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				name="email"
			  />
			  <input
			  name="password"
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			  />
			</div>
			<CtaButton text="Login" type="submit" />
			<div style={{display:'flex',gap:'10px'}}>
				
			<div style={{display:'flex',gap:'10px',alignItems:'center'}}><p>If you dont have account please 			<Link to='/register' style={{color:'blue'}}>Register</Link>
			</p>

			</div>
			</div>
		  </form>
		</div>
	  </div>
	);
  };

export default Login;
