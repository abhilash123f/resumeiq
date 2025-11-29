import { Link, useNavigate } from 'react-router-dom';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600">
            AI Resume Matcher
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
            <Link to="/resume-builder" className="text-gray-700 hover:text-primary-600">
              Build Resume
            </Link>
            <Link to="/my-resumes" className="text-gray-700 hover:text-primary-600">
              My Resumes
            </Link>
            <Link to="/upload" className="text-gray-700 hover:text-primary-600">
              Analysis
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
