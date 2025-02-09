import { useState } from 'react'
import { Box, Button, TextField, Typography, useTheme, CircularProgress } from "@mui/material"
import { tokens } from "../../theme"
import { supabase } from '../../supabaseClient'
import { Link } from 'react-router-dom'

const ResetPassword = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      setMessage('')
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      
      if (error) throw error
      
      setMessage('Check your email for the password reset link')
    } catch (error) {
      setError(error.message)
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
        <Typography variant="h2" mb={3}>Reset Password</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {message && <Typography color="success.main" mb={2}>{message}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
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
            {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </form>
        <Box mt={2}>
          <Link to="/login">Back to Login</Link>
        </Box>
      </Box>
    </Box>
  )
}

export default ResetPassword 