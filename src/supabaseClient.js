import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otixrnhzetxstjqyahri.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aXhybmh6ZXR4c3RqcXlhaHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MzI4ODMsImV4cCI6MjA0NTQwODg4M30.YUck-dp_eMn45eK5lnlvyUOAp1mX1bOIcPJBc6pVk48'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 