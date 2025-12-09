CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

INSERT INTO exercises (name, category) VALUES
-- Chest
('Bench Press', 'Chest'),
('Push Ups', 'Chest'),
('Incline Dumbbell Press', 'Chest'),
('Chest Fly', 'Chest'),
('Cable Crossovers', 'Chest'),
('Pec Deck', 'Chest'),
('Low to High Cable Fly', 'Chest'),

-- Back
('Pull Ups', 'Back'),
('Lat Pulldown', 'Back'),
('Bent Over Row', 'Back'),
('Deadlift', 'Back'),
('Face Pulls', 'Back'),
('Barbell Row', 'Back'),
('Cable Row', 'Back'),
('Chest Supported Row', 'Back'),
('Reverse Pec Deck', 'Back'),

-- Legs
('Squat', 'Legs'),
('Lunges', 'Legs'),
('Leg Press', 'Legs'),
('Calf Raises', 'Legs'),
('Romanian Deadlift', 'Legs'),
('Leg Extensions', 'Legs'),
('Leg Curl', 'Legs'),
('Hip Thrust', 'Legs'),
('Bulgarian Split Squat', 'Legs'),

-- Shoulders
('Shoulder Press', 'Shoulders'),
('Lateral Raises', 'Shoulders'),
('Front Raises', 'Shoulders'),
('Shrugs', 'Shoulders'),
('Dumbbell Lateral Raise', 'Shoulders'),

-- Arms
('Bicep Curls', 'Arms'),
('Bayesian Curls', 'Arms'),
('Tricep Extensions', 'Arms'),
('Hammer Curls', 'Arms'),
('Skullcrushers', 'Arms'),
('Preacher Curls', 'Arms'),
('Tricep Pushdown', 'Arms'),

-- Core
('Plank', 'Core'),
('Crunches', 'Core'),
('Leg Raises', 'Core'),
('Russian Twists', 'Core'),
('Ab Wheel', 'Core'),
('Hanging Leg Raise', 'Core'),
('Glute Bridge', 'Core');
