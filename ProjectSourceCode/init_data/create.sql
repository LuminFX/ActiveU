-- USER STUFF

    CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');

    CREATE TABLE users (
        
        username VARCHAR(50) PRIMARY KEY,
        email VARCHAR(200) NOT NULL,
        password CHAR(60) NOT NULL
    );

    CREATE TABLE friendships (
        
        user1 VARCHAR(50) NOT NULL,
        user2 VARCHAR(50) NOT NULL,
        
        status friendship_status DEFAULT 'pending',
        
        PRIMARY KEY (user1, user2),
        FOREIGN KEY (user1) REFERENCES users(username) ON DELETE CASCADE,
        FOREIGN KEY (user2) REFERENCES users(username) ON DELETE CASCADE
        -- referenced from lab 6.
    );

-- WORKOUT STUFF

    -- the workouts table records each workout session. high-level
    -- the exercises table logs individual exercises within each workout.
    
    -- linking the two allows for multiple exercises per workout.


    CREATE TABLE workouts (
        
        workout_id SERIAL PRIMARY KEY,
        
        username VARCHAR(50) NOT NULL,
        workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
        duration INTERVAL,
        
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    );

    CREATE TABLE exercises (
        
        exercise_id SERIAL PRIMARY KEY,
        workout_id INT NOT NULL,
        
        exercise_name VARCHAR(100) NOT NULL,    -- name of the exercise (e.g., 'Bicep Curl')
        type VARCHAR(50) NOT NULL,              -- type of exercise (e.g., 'cardio', 'strength')
        muscle_group VARCHAR(50),               -- muscle targeted (e.g., 'biceps')
        equipment VARCHAR(50),                  -- equipment needed (e.g., 'dumbbell')
        difficulty VARCHAR(20),                 -- difficulty level (e.g., 'beginner')
        reps INT,                               -- number of repetitions
        sets INT,                               -- number of sets
        duration INTERVAL,                      -- time spent (for cardio or timed exercises)
        weight DECIMAL(5, 2),                   -- weight used, if applicable (use lbs?)
        notes TEXT,                             -- additional notes or instructions
        
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE
    );

    /*
    CREATE TABLE workout_reactions (
        
        reaction_id SERIAL PRIMARY KEY,
        workout_id INT NOT NULL,
        
        username VARCHAR(50) NOT NULL,
        reaction TEXT,  -- could be a comment or emoji
        
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    );
    */ -- uncomment when ready to approach. i doubt there's anything to modify
    
