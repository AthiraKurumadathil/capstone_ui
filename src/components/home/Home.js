import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('Home component mounted, user data:', user);
  console.log('Token:', localStorage.getItem('token'));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isOrgPage = location.pathname === '/organizations' || location.pathname.startsWith('/organizations/');
  const isActivityPage = location.pathname === '/activities' || location.pathname.startsWith('/activities/');
  const isTrainerPage = location.pathname === '/trainers' || location.pathname.startsWith('/trainers/');
  const isActivityTrainerPage = location.pathname === '/activitytrainers' || location.pathname.startsWith('/activitytrainers/');
  const isAttendancePage = location.pathname === '/attendance' || location.pathname.startsWith('/attendance/');
  const isBatchPage = location.pathname === '/batches' || location.pathname.startsWith('/batches/');
  const isStudentPage = location.pathname === '/students' || location.pathname.startsWith('/students/');
  const isBatchSessionPage = location.pathname === '/batchsessions' || location.pathname.startsWith('/batchsessions/');

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="app-title">Activity Tracker</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="home-wrapper">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${!isOrgPage && !isActivityPage && !isTrainerPage && !isActivityTrainerPage && !isAttendancePage && !isBatchPage && !isStudentPage && !isBatchSessionPage ? 'active' : ''}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
            <button 
              className={`sidebar-link ${isOrgPage ? 'active' : ''}`}
              onClick={() => navigate('/organizations')}
            >
              Organizations
            </button>
            <button 
              className={`sidebar-link ${isActivityPage ? 'active' : ''}`}
              onClick={() => navigate('/activities')}
            >
              Activities
            </button>
            <button 
              className={`sidebar-link ${isTrainerPage ? 'active' : ''}`}
              onClick={() => navigate('/trainers')}
            >
              Trainers
            </button>
            <button 
              className={`sidebar-link ${isActivityTrainerPage ? 'active' : ''}`}
              onClick={() => navigate('/activitytrainers')}
            >
              Activity Trainers
            </button>
            <button 
              className={`sidebar-link ${isAttendancePage ? 'active' : ''}`}
              onClick={() => navigate('/attendance')}
            >
              Attendance
            </button>
            <button 
              className={`sidebar-link ${isBatchPage ? 'active' : ''}`}
              onClick={() => navigate('/batches')}
            >
              Batches
            </button>
            <button 
              className={`sidebar-link ${isStudentPage ? 'active' : ''}`}
              onClick={() => navigate('/students')}
            >
              Students
            </button>
            <button 
              className={`sidebar-link ${isBatchSessionPage ? 'active' : ''}`}
              onClick={() => navigate('/batchsessions')}
            >
              Batch Sessions
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="home-content">
          <div className="welcome-card">
            <h2>Welcome, {user.name || user.email || 'User'}!</h2>
            <p>You have successfully logged in to the application.</p>
            <div className="user-info">
              <p><strong>Email:</strong> {user.email}</p>
              {user.name && <p><strong>Name:</strong> {user.name}</p>}
            </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
