import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, login } from '../api';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await signup(formData);

      onLogin(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
              <span className="text-5xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Sign in to continue your journey' : 'Start building amazing resumes with AI'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>{isLogin ? '🚀 Sign In' : '✨ Create Account'}</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ email: '', password: '', name: '' });
                }}
                className="text-gray-300 hover:text-white text-sm transition-colors"
              >
                {isLogin ? (
                  <span>Don't have an account? <span className="font-semibold text-purple-400">Sign up</span></span>
                ) : (
                  <span>Already have an account? <span className="font-semibold text-purple-400">Sign in</span></span>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center mb-3">What you'll get:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>AI Resume Builder</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Smart Matching</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>ATS Optimization</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>100% Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
