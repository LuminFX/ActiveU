// ------------------------------------
//         Import Dependencies
// ------------------------------------

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// ------------------------------------
//           Connect to DB
// ------------------------------------

const dbConfig = {
  host: process.env.POSTGRES_HOST, // the database server
  port: process.env.POSTGRES_PORT, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD,// the password of the user account
  api_key: process.env.API_KEY
};

const db = pgp(dbConfig);

// test database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// ------------------------------------
//            App Settings
// ------------------------------------
// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});
// Register `hbs` as our view engine using its bound `engine()` function.

app.use(express.static(path.join(__dirname, 'views'))); //This line fixes the images for some reason.

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());

app.use( // initialize session variables
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// ------------------------------------
//             API Routes
// ------------------------------------

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // If session variable `user` is not set, redirect to login page
    return res.redirect('/login');
  }
  res.locals.auth = true; // User is authenticated, set `auth` to true
  // res.locals.message = req.session.message || null; // Pass message to locals
  // res.locals.error = req.session.error || false; // Pass error status to locals

  // // Clear session messages to prevent them from persisting
  // req.session.message = null;
  // req.session.error = null;
  next(); // Proceed to the next middleware or route handler if authenticated
};

// Get Requests

app.get('/', (req, res) => { // temporary route that just shows a message
  // removing this temp response.
  // res.send('<h1>This is Project-ActiveU!</h1>'); 
  res.redirect('/login'); // Redirect to the /login route
});

app.get('/login', (req, res) => {
  const message = req.session.message;
  const error = req.session.error;

  //clear the message and error after rendering
  req.session.message = null;
  req.session.error = null;

  res.render('pages/login', {
    message: message,
    error: error
  });
});

app.get('/register', (req, res) => {
  const message = req.session.message;
  const error = req.session.error;

  // Clear session variables after retrieving them
  req.session.message = null;
  req.session.error = null;

  res.render('pages/register', { message, error });
});

app.get('/home', auth, async (req, res) => {
  res.render('pages/home');
});

app.get('/friends', auth, async (req, res) => {
   //clear the message and error after rendering
   req.session.message = null;
   req.session.error = null;
  try {
    const username = req.session.user.username;

    const acceptedFriendsQuery = `
      SELECT 
        CASE 
          WHEN user1 = $1 THEN user2 
          ELSE user1 
        END AS username
      FROM friendships
      WHERE (user1 = $1 OR user2 = $1) AND status = 'accepted';
    `;

    const pendingFriendsQuery = `
      SELECT 
        CASE 
          WHEN user1 = $1 THEN user2 
          ELSE user1 
        END AS username
      FROM friendships
      WHERE (user2 = $1) AND status = 'pending'
    `;

    const sentFriendsQuery = `
      SELECT 
        CASE 
          WHEN user1 = $1 THEN user2 
          ELSE user1 
        END AS username
      FROM friendships
      WHERE (user1 = $1) AND status = 'pending'
    `;

    const friends = await db.any(acceptedFriendsQuery, [username]);
    const pending = await db.any(pendingFriendsQuery, [username]);
    const sent = await db.any(sentFriendsQuery, [username]);


    res.render('pages/friends', {
      friends,
      pending,
      sent
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/welcome', (req, res) => { // dummy request for testing lab 11
  res.json({ status: 'success', message: 'Welcome!' });
});

app.get('/account', auth, async (req, res) => { // get basic account information for now. TODO: add workouts and friends fetching
  //clear the message and error after rendering
  req.session.message = null;
  req.session.error = null;
  try {
    const username = req.session.user.username;
    const userQuery = 'SELECT username, email FROM users WHERE username = $1';
    const userData = await db.oneOrNone(userQuery, [username]);
    const acceptedFriendsQuery = `
      SELECT 
        CASE 
          WHEN user1 = $1 THEN user2 
          ELSE user1 
        END AS username
      FROM friendships
      WHERE (user1 = $1 OR user2 = $1) AND status = 'accepted';
    `;
    const friends = await db.any(acceptedFriendsQuery, [username]);

    const workout_query = `
      SELECT workout_name, duration, DATE(workout_date) AS workout_date
      FROM workouts
      WHERE ($1 = workouts.username);
    `;

    const workout = await db.any(workout_query, [username]);
    console.log(workout);
    if (userData) {
      res.render('pages/account', { userData, friends, workout });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching primary user data', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/createWorkout', auth, (req, res) => {
  //clear the message and error after rendering
  req.session.message = null;
  req.session.error = null;
  res.render('pages/createWorkout'); // Render createWorkout.hbs
});

// Route for Add Workout page
app.get('/logWorkout', auth, (req, res) => {
  res.render('pages/logWorkout'); // Render addWorkout.hbs
});


app.get('/profile', auth, async (req, res) => {
  const actual_user = req.session.user.username;
  const username = req.query.username;

  const email_query = `
    SELECT email
    FROM users
    WHERE ($1 = users.username);
  `;
  const emailResult = await db.any(email_query, [username]);
  const email = emailResult[0].email;

  const acceptedFriendsQuery = `
    SELECT 
      CASE 
        WHEN user1 = $1 THEN user2 
        ELSE user1 
      END AS username
    FROM friendships
    WHERE (user1 = $1 OR user2 = $1) AND status = 'accepted';
  `;

  const friends = await db.any(acceptedFriendsQuery, [username]);
  const user_friends = await db.any(acceptedFriendsQuery, [actual_user]);

  const workout_query = `
      SELECT workout_name, duration, DATE(workout_date) AS workout_date
      FROM workouts
      WHERE ($1 = workouts.username);
    `;

  const workout = await db.any(workout_query, [username]);
  friends.forEach(element => {
    if (element.username == actual_user) {
      return;
    } else if (user_friends.some((item) => item.username == element.username)) {
      element.isMutual = true;
      element.isPotential = false;
    } else {
      element.isMutual = false;
      element.isPotential = true;
    }
  });
  res.render('pages/viewFriends', { username, friends, email, workout });
});

// Post Requests

app.post('/add-workout', async (req, res) => {
  const username = req.session.user.username;
  const duration = req.body.workoutData.duration;
  const workout_name = req.body.workoutData.name;
  try {
    await db.query(
      `
      INSERT INTO workouts(username, workout_name, duration)
      VALUES ($1, $2, $3);
      `,
      [username, workout_name, duration]
    );
    res.redirect('/home');
  } catch (error) {
    console.error('Error adding Workout:', error);
    res.redirect('/home');
  }
});

app.post('/friend-request/approve', async (req, res) => {
  const { username } = req.body;
  const currentUser = req.session.user.username;

  try {
    await db.query(
      `
      UPDATE friendships
      SET status = 'accepted'
      WHERE user1 = $1 AND user2 = $2
      `,
      [username, currentUser]
    );

    res.redirect('/friends');

  } catch (error) {
    console.error('Error approving friend request:', error);

    res.redirect('/friends');

  }
});

app.post('/friend-request/decline', async (req, res) => {
  const { username } = req.body;
  const currentUser = req.session.user.username;

  try {
    await db.query(
      `
      DELETE FROM friendships
      WHERE user1 = $1 AND user2 = $2
      `,
      [username, currentUser]
    );

    res.redirect('/friends');

  } catch (error) {
    console.error('Error declining friend request:', error);
    res.redirect('/friends');
  }
});

app.post('/friend-request/cancel', async (req, res) => {
  const { username } = req.body;
  const currentUser = req.session.user.username;

  try {
    await db.query(
      `
      DELETE FROM friendships
      WHERE user1 = $1 AND user2 = $2 AND status = 'pending'
      `,
      [currentUser, username]
    );

    res.redirect('/friends');
  } catch (error) {
    console.error('Error canceling friend request:', error);

    res.redirect('/friends');
  }
});

app.post('/friend-request/remove', async (req, res) => {
  const { username } = req.body;
  const currentUser = req.session.user.username;

  try {
    await db.query(
      `
      DELETE FROM friendships
      WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)
      `,
      [currentUser, username]
    );

    res.redirect('/friends');
  } catch (error) {
    console.error('Error removing friend:', error);
    res.redirect('/friends');
  }
});

app.post('/friend-request/send', async (req, res) => {
  const { username } = req.body;
  const currentUser = req.session.user.username;

  if (!username) {
    req.session.message = 'Please enter a valid username.';
    req.session.error = true;
    return req.session.save(() => res.redirect('/friends'));
  }

  try {
    const userExists = await db.oneOrNone(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );

    if (!userExists) {
      req.session.message = `User ${username} does not exist.`;
      req.session.error = true;
      return req.session.save(() => res.redirect('/friends'));
    }

    const existingRequest = await db.oneOrNone(
      `
      SELECT * FROM friendships
      WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)
      `,
      [currentUser, username]
    );

    if (existingRequest) {
      req.session.message = `A friend request or friendship already exists with ${username}.`;
      req.session.error = true;
      return req.session.save(() => res.redirect('/friends'));
    }

    await db.query(
      `
      INSERT INTO friendships (user1, user2, status)
      VALUES ($1, $2, 'pending')
      `,
      [currentUser, username]
    );

    req.session.message = `Friend request sent to ${username}.`;
    req.session.error = false;
    req.session.save(() => res.redirect('/friends'));
  } catch (error) {
    console.error('Error sending friend request:', error);

    req.session.message = 'An error occurred while sending the friend request.';
    req.session.error = true;
    req.session.save(() => res.redirect('/friends'));
  }
});


app.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    // query to find the user by username
    const userQuery = 'SELECT * FROM users WHERE username = $1 OR email = $1';
    const user = await db.oneOrNone(userQuery, [usernameOrEmail]);

    // if user is not found
    if (!user) {
      req.session.message = 'Email or username not found. Register here';
      req.session.error = true;
      return res.status(400).redirect('/register');
    }

    // compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);

    // if password does not match
    if (!match) {
      req.session.message = 'Incorrect password';
      req.session.error = true;
      return res.status(400).redirect('/login');
    }

    // if password matches
    req.session.message = null; // Clear any previous messages
    req.session.error = null;

    req.session.user = user;
    req.session.save(() => {
      res.redirect('/home');
    });

  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).render('pages/login');  // Set status 500 here for unexpected errors
  }
});

app.post('/register', async (req, res) => {
  try {
    let password = req.body.password;

    if (!password || password.length < 5) {
      req.session.message = 'Password must be at least 5 characters long.';
      req.session.error = true;
      return res.status(400).redirect('/register');
    }
    // hash the password using bcrypt with a salt factor of 10
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // SQL query to insert the user into the database
    const insertUserQuery = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
    `;
    await db.none(insertUserQuery, [req.body.username, req.body.email, hashedPassword]);

    // on success, redirect to login
    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).redirect('/register');  // Set status 500 here for unexpected errors
  }
});

// Get requests

app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/'); // Redirect to home if session destruction fails
    }

    // Render the logout page with a success message
    res.render('pages/logout');
  });
});

app.get('/debug/users', async (req, res) => {
  try {
    const users = await db.any('SELECT * FROM users');
    res.json(users); // Return the data as JSON
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});

app.get('/debug/friends', async (req, res) => {
  try {
    const friendships = await db.any('SELECT * FROM friendships');
    res.json(friendships); // Return the data as JSON
  } catch (error) {
    console.error('Error fetching friendships:', error);
    res.status(500).send('Error fetching users');
  }
});

app.get('/debug/add-workout', async (req, res) => {
  try {
    const workout = await db.any('SELECT * FROM workouts');
    res.json(workout); // Return the data as JSON
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).send('Error fetching workouts');
  }
});

app.get('/genpassword/:password', async (req, res) => {
  try {
    const password = req.params.password;

    if (!password || password.length < 5) {
      return res.status(400).json({ message: 'Password must be at least 5 characters long.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    res.json({ hashedPassword });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});



app.get('/api/workouts', async (req, res) => {
  const { difficulty, muscle, type } = req.query;

  console.log("Received query parameters:", { difficulty, muscle, type });

  try {
      // Ensure at least one parameter is provided
      if (!difficulty && !muscle && !type) {
          return res.status(400).json({ error: "At least one filter (difficulty, muscle, or type) must be provided." });
      }

      // Determine filter and construct the API URL
      let filter = '';
      let value = '';
      if (difficulty) {
          filter = 'difficulty';
          value = difficulty;
      } else if (muscle) {
          filter = 'muscle';
          value = muscle;
      } else if (type) {
          filter = 'type';
          value = type;
      }
      const apiUrl = `https://api.api-ninjas.com/v1/exercises?${filter}=${encodeURIComponent(value)}`;
      console.log(`Fetching from API: ${apiUrl}`);

      // Make the API request
      const apiKey = process.env.API_KEY;
      const response = await axios.get(apiUrl, {
          headers: { 'X-Api-Key': apiKey },
      });

      // Send the API response to the client
      res.json(response.data);
  } catch (error) {
      if (error.response) {
          console.error("Error in API call:", {
              status: error.response.status,
              data: error.response.data,
          });
      } else if (error.request) {
          console.error("No response received from API:", error.request);
      } else {
          console.error("Error setting up API request:", error.message);
      }
      res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// ------------------------------------
//             Start Server
// ------------------------------------
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
