import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Home from './components/home/Home';
import PrivateRoute from './components/PrivateRoute';
import CategoryList from './components/category/CategoryList';
import CategoryForm from './components/category/CategoryForm';
import CategoryDetail from './components/category/CategoryDetail';
import FeePlanList from './components/feeplan/FeePlanList';
import FeePlanForm from './components/feeplan/FeePlanForm';
import FeePlanDetail from './components/feeplan/FeePlanDetail';
import OrganizationList from './components/organization/OrganizationList';
import OrganizationForm from './components/organization/OrganizationForm';
import OrganizationDetail from './components/organization/OrganizationDetail';
import ActivityList from './components/activity/ActivityList';
import ActivityForm from './components/activity/ActivityForm';
import ActivityDetail from './components/activity/ActivityDetail';
import TrainerList from './components/trainer/TrainerList';
import TrainerForm from './components/trainer/TrainerForm';
import TrainerDetail from './components/trainer/TrainerDetail';
import ActivityTrainerList from './components/activitytrainer/ActivityTrainerList';
import ActivityTrainerForm from './components/activitytrainer/ActivityTrainerForm';
import ActivityTrainerDetail from './components/activitytrainer/ActivityTrainerDetail';
import AttendanceList from './components/attendance/AttendanceList';
import AttendanceForm from './components/attendance/AttendanceForm';
import AttendanceDetail from './components/attendance/AttendanceDetail';
import BatchList from './components/batch/BatchList';
import BatchForm from './components/batch/BatchForm';
import BatchDetail from './components/batch/BatchDetail';
import StudentList from './components/student/StudentList';
import StudentForm from './components/student/StudentForm';
import StudentDetail from './components/student/StudentDetail';
import BatchSessionList from './components/batchsession/BatchSessionList';
import BatchSessionForm from './components/batchsession/BatchSessionForm';
import BatchSessionDetail from './components/batchsession/BatchSessionDetail';
import InvoiceList from './components/invoice/InvoiceList';
import InvoiceForm from './components/invoice/InvoiceForm';
import InvoiceDetail from './components/invoice/InvoiceDetail';
import PaymentList from './components/payment/PaymentList';
import PaymentForm from './components/payment/PaymentForm';
import PaymentDetail from './components/payment/PaymentDetail';
import RoleList from './components/role/RoleList';
import RoleForm from './components/role/RoleForm';
import RoleDetail from './components/role/RoleDetail';
import UserList from './components/user/UserList';
import UserForm from './components/user/UserForm';
import UserDetail from './components/user/UserDetail';
import ChangePassword from './components/user/ChangePassword';
import ForgotPassword from './components/user/ForgotPassword';
import EnrollmentList from './components/enrollment/EnrollmentList';
import EnrollmentForm from './components/enrollment/EnrollmentForm';
import EnrollmentDetail from './components/enrollment/EnrollmentDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        
        {/* Category Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/categories/create"
          element={
            <PrivateRoute>
              <CategoryForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/edit/:categoryId"
          element={
            <PrivateRoute>
              <CategoryForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/:categoryId"
          element={
            <PrivateRoute>
              <CategoryDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <CategoryList />
            </PrivateRoute>
          }
        />
        
        {/* Fee Plan Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/feeplans/create"
          element={
            <PrivateRoute>
              <FeePlanForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/feeplans/edit/:feePlanId"
          element={
            <PrivateRoute>
              <FeePlanForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/feeplans/:feePlanId"
          element={
            <PrivateRoute>
              <FeePlanDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/feeplans"
          element={
            <PrivateRoute>
              <FeePlanList />
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

        {/* Trainer Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/trainers/create"
          element={
            <PrivateRoute>
              <TrainerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainers/edit/:trainerId"
          element={
            <PrivateRoute>
              <TrainerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainers/:trainerId"
          element={
            <PrivateRoute>
              <TrainerDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainers"
          element={
            <PrivateRoute>
              <TrainerList />
            </PrivateRoute>
          }
        />

        {/* Activity Trainer Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/activitytrainers/create"
          element={
            <PrivateRoute>
              <ActivityTrainerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/activitytrainers/edit/:activityId/:trainerId"
          element={
            <PrivateRoute>
              <ActivityTrainerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/activitytrainers/:activityId/:trainerId"
          element={
            <PrivateRoute>
              <ActivityTrainerDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/activitytrainers"
          element={
            <PrivateRoute>
              <ActivityTrainerList />
            </PrivateRoute>
          }
        />

        {/* Attendance Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/attendance/create"
          element={
            <PrivateRoute>
              <AttendanceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance/edit/:attendanceId"
          element={
            <PrivateRoute>
              <AttendanceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance/:attendanceId"
          element={
            <PrivateRoute>
              <AttendanceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <AttendanceList />
            </PrivateRoute>
          }
        />

        {/* Batch Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/batches/create"
          element={
            <PrivateRoute>
              <BatchForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/batches/edit/:batchId"
          element={
            <PrivateRoute>
              <BatchForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/batches/:batchId"
          element={
            <PrivateRoute>
              <BatchDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/batches"
          element={
            <PrivateRoute>
              <BatchList />
            </PrivateRoute>
          }
        />

        {/* Student Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/students/create"
          element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/edit/:studentId"
          element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/:studentId"
          element={
            <PrivateRoute>
              <StudentDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          }
        />

        {/* Batch Session Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/batchsessions/create"
          element={
            <PrivateRoute>
              <BatchSessionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/batchsessions/edit/:sessionId"
          element={
            <PrivateRoute>
              <BatchSessionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/batchsessions/:sessionId"
          element={
            <PrivateRoute>
              <BatchSessionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/batchsessions"
          element={
            <PrivateRoute>
              <BatchSessionList />
            </PrivateRoute>
          }
        />

        {/* Invoice Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/invoices/create"
          element={
            <PrivateRoute>
              <InvoiceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/edit/:invoiceId"
          element={
            <PrivateRoute>
              <InvoiceForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices/:invoiceId"
          element={
            <PrivateRoute>
              <InvoiceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <InvoiceList />
            </PrivateRoute>
          }
        />

        {/* Payment Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/payments/create"
          element={
            <PrivateRoute>
              <PaymentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments/edit/:paymentId"
          element={
            <PrivateRoute>
              <PaymentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments/:paymentId"
          element={
            <PrivateRoute>
              <PaymentDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <PaymentList />
            </PrivateRoute>
          }
        />

        {/* Role Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/roles/create"
          element={
            <PrivateRoute>
              <RoleForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/roles/edit/:roleId"
          element={
            <PrivateRoute>
              <RoleForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/roles/:roleId"
          element={
            <PrivateRoute>
              <RoleDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <PrivateRoute>
              <RoleList />
            </PrivateRoute>
          }
        />

        {/* User Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/users/create"
          element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/edit/:userId"
          element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/change-password"
          element={<ChangePassword />}
        />
        <Route
          path="/users/:userId"
          element={
            <PrivateRoute>
              <UserDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          }
        />

        {/* Enrollment Routes - Order matters! Specific routes before dynamic routes */}
        <Route
          path="/enrollments/create"
          element={
            <PrivateRoute>
              <EnrollmentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/enrollments/edit/:enrollmentId"
          element={
            <PrivateRoute>
              <EnrollmentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/enrollments/:enrollmentId"
          element={
            <PrivateRoute>
              <EnrollmentDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <PrivateRoute>
              <EnrollmentList />
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
