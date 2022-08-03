import './App.css';
import React from "react";
import "antd/dist/antd.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './components/auth/AuthProvider';
import { RequireAuth } from './components/auth/RequiredAuth';
import LayoutPage from './components/LayoutPage/LayoutPage';
import LogIn from './components/Login/LogIn';
import Register from './components/Register/Register';
import Projects from './components/LayoutPage/pages/Projects/Projects';
import ProjectItem from './components/LayoutPage/pages/Projects/ProjectItem/ProjectItem';
import NotFound from './components/LayoutPage/pages/404/NotFound';
import Statistics from './components/LayoutPage/pages/Statistics/Statistics';
import UserList from './components/LayoutPage/pages/UserList/UserList';
import NewProject from './components/LayoutPage/pages/Projects/NewProject/NewProject';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoute from './features/auth/PrivateRoute';
import { Navigate } from 'react-router-dom';
function App() {
  return (

    <div className="App" >
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LayoutPage />}>
              <Route index element={<Navigate to ='projects'/>} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/add-project" element={<NewProject />} />
              <Route path="/projects/:projectId" element={<ProjectItem />} />
               <Route
                path="statistics"
                element={
                  <PrivateRoute>
                    <Statistics />
                  </PrivateRoute>
                } />
              <Route
                path="user-list"
                element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                } />
            </Route>

            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer />
    </div>

  );
}

export default App;
