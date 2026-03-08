import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqkgzrwvrljbopxmmmmn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa2d6cnd2cmxqYm9weG1tbW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzA2MDQsImV4cCI6MjA4ODUwNjYwNH0.Vvv1MCQMvSSeeN4ClQH5dAlt8BVgYber5xWwSboYDr8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
