import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Home from './components/home/Home';
import PrivateRoute from './components/PrivateRoute';
import OrganizationList from './components/organization/OrganizationList';
import OrganizationForm from './components/organization/OrganizationForm';
import OrganizationDetail from './components/organization/OrganizationDetail';
import ActivityList from './components/activity/ActivityList';
import ActivityForm from './components/activity/ActivityForm';
import ActivityDetail from './components/activity/ActivityDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        
        {/* Organization Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/organizations/create"
          element={
            <PrivateRoute>
              <OrganizationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations/edit/:orgId"
          element={
            <PrivateRoute>
              <OrganizationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations/:orgId"
          element={
            <PrivateRoute>
              <OrganizationDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations"
          element={
            <PrivateRoute>
              <OrganizationList />
            </PrivateRoute>
          }
        />

        {/* Activity Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/activities/create"
          element={
            <PrivateRoute>
              <ActivityForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities/edit/:activityId"
          element={
            <PrivateRoute>
              <ActivityForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities/:activityId"
          element={
            <PrivateRoute>
              <ActivityDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <PrivateRoute>
              <ActivityList />
            </PrivateRoute>
          }
        />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
