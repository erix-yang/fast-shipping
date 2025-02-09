import { useState } from 'react'
import { Box, Button, TextField, Typography, useTheme, Alert, CircularProgress } from "@mui/material"
import { tokens } from "../../theme"
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      setLoading(true)
      const { error } = await login(email, password)
      if (error) {
        console.error('Login error details:', error)
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email or password is incorrect')
        }
        throw error
      }
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Box width="300px">
        <Typography variant="h2" mb={3}>Login</Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            type="email"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: colors.blueAccent[700],
              '&:hover': { backgroundColor: colors.blueAccent[800] }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Link to="/register">Need an account?</Link>
          <Link to="/reset-password">Forgot Password?</Link>
        </Box>
      </Box>
    </Box>
  )
}

export default Login 