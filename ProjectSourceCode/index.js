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
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
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

app.get('/', (req, res) => { // temporary route that just shows a message
    // removing this temp response.
    // res.send('<h1>This is Project-ActiveU!</h1>'); 
    res.redirect('/register'); // Redirect to the /login route
});
app.get('/login', (req, res) => {
  res.render('pages/login'); // Render login.hbs (assuming it's in views/pages folder)
});
app.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    //query to find the user by username
    const userQuery = 'SELECT * FROM users WHERE username = $1 OR email = $1';
    const user = await db.oneOrNone(userQuery, [usernameOrEmail]);

    //if user is not found redirect to register
    if (!user) {
      return res.redirect('/register');
    }

    //compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);

    //if password does not match render login page with error message
    if (!match) {
      return res.render('pages/login', {
        message: 'Incorrect username or password.'
      });
    }

    //if password matches save user details in session and redirect to /home
    req.session.user = user;
    req.session.save(() => {
      res.redirect('/home');
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.render('pages/login', {
      message: 'An error occurred during login. Please try again.'
    });
  }
});
// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // If session variable `user` is not set, redirect to login page
    return res.redirect('/login');
  }
  next(); // Proceed to the next middleware or route handler if authenticated
};

app.get('/register', (req, res) => {
  res.render('pages/register'); // Render register.hbs (assuming it's in views/pages folder)
});

app.get('/home', (req, res) => {
  res.render('pages/home'); // Render register.hbs (assuming it's in views/pages folder)
});

app.post('/register', async (req, res) => {
  try {
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

    // on failure redirect back to register
    res.redirect('/register');
  }
});

app.get('/home', auth, async (req, res) => {
  res.render('pages/home');
});
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
// ------------------------------------
//             Start Server
// ------------------------------------
app.listen(3000);
console.log('Server is listening on port 3000');
