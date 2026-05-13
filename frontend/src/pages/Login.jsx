import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/chat')
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Login error')
        return
      }

      localStorage.setItem('token', data.access_token)
      navigate('/chat')
    } catch {
      setError('Error connecting to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{ width: '100%', maxWidth: 400 }}>
        <h3 className="text-center mb-4">Sign in to InstantMessenger</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Loading...' : 'Log in'}
          </button>
        </form>

        <div className="text-center mt-3">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </main>
  )
}
