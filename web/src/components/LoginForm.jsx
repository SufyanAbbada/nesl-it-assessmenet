import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './LoginForm.css';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateUserId = (id) => {
    if (!id.trim()) {
      return 'User ID is required';
    }
    if (id.length < 2) {
      return 'User ID must be at least 2 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateUserId(userId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(userId);
      if (result.success) {
        navigate('/feed');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.log("An unexpected error occurred: ",err)
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-right" />
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID (e.g., u1, u2)"
              className={error ? 'error' : ''}
              disabled={loading}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo users: u1 (user), u2 (admin)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;