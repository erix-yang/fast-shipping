import { useState, useEffect } from 'react'
import { Box, Button, TextField, Typography, useTheme, CircularProgress, Alert } from "@mui/material"
import { tokens } from "../../theme"
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

const Profile = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    getProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function getProfile() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      setError('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('id', user.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
    } catch (error) {
      setError('Error updating profile!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box m="20px">
      <Typography variant="h2" mb={3}>Profile Settings</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        >
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={profile.full_name || ''}
            onChange={handleChange}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={profile.address || ''}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ gridColumn: "span 4" }}
          />
        </Box>
        <Box display="flex" justifyContent="end" mt="20px">
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor: colors.blueAccent[700],
              '&:hover': { backgroundColor: colors.blueAccent[800] }
            }}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default Profile 