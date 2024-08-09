import React from 'react';
import {
	Create,
	Dashboard,
	Landing,
	Login,
	Register,
	Status,
	Exam
} from './containers';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MaliciousScreen from './containers/maliciousdata/MaliciousScreen';
import Attendance from './containers/attendance/Attendance';

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route exact path="/" element={<Landing />} />
					<Route path="/register" element={<Register />} />
					<Route path="/create" element={<Create />} />
					<Route path="/login" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/status" element={<Status />} />
					<Route path="/exam" element={<Exam />} />
					<Route path="/suspicious" element={<MaliciousScreen />} />
					<Route path="/attendance" element={<Attendance />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;
