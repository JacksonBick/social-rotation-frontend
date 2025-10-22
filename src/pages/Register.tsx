// Register page - new user signup
// Form fields: name, email, password (with show/hide toggle), password confirmation
// On success: saves token and redirects to dashboard
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import './Auth.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [accountType, setAccountType] = useState('personal') // 'personal' or 'agency'
  const [companyName, setCompanyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)

    try {
      const response = await authAPI.register(name, email, password, accountType, companyName)
      const { user, token } = response.data
      
      login(user, token)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Social Rotation</h1>
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="personal">Personal Account</option>
              <option value="agency">Agency/Reseller Account</option>
            </select>
            <small style={{color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block'}}>
              {accountType === 'agency' 
                ? 'Manage multiple client accounts and create private marketplace items' 
                : 'Single user account for personal use'}
            </small>
          </div>

          {accountType === 'agency' && (
            <div className="form-group">
              <label htmlFor="companyName">Company/Agency Name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Your Agency Name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  {showPassword && <line x1="1" y1="1" x2="23" y2="23"></line>}
                </svg>
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="passwordConfirmation">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="passwordConfirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  {showPasswordConfirmation && <line x1="1" y1="1" x2="23" y2="23"></line>}
                </svg>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
