import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import MyResumes from './pages/MyResumes';
import ResumeView from './pages/ResumeView';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} 
          />
          <Route 
            path="/auth" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} 
          />
          <Route 
            path="/upload" 
            element={isAuthenticated ? <Upload /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/results/:matchId" 
            element={isAuthenticated ? <Results /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/resume-builder" 
            element={isAuthenticated ? <ResumeBuilder /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/my-resumes" 
            element={isAuthenticated ? <MyResumes /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/resume-view/:id" 
            element={isAuthenticated ? <ResumeView /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
