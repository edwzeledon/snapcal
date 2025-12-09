-- Add duration and status columns to workout_logs table
ALTER TABLE workout_logs 
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
