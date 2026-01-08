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

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="app-title">Capstone UI</h1>
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
              className={`sidebar-link ${!isOrgPage ? 'active' : ''}`}
              onClick={() => navigate('/home')}
            >
              Dashboard
            </button>
            <button 
              className={`sidebar-link ${isOrgPage ? 'active' : ''}`}
              onClick={() => navigate('/organizations')}
            >
              Organizations
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
