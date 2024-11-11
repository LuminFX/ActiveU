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
  res.redirect('/login'); // Redirect to the /login route
});
app.get('/login', (req, res) => {
  res.render('pages/login'); // Render login.hbs (assuming it's in views/pages folder)
});

app.get('/register', (req, res) => {
  res.render('pages/register'); // Render register.hbs (assuming it's in views/pages folder)
});

app.post('/register', async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!password || password.length < 5) {
    return res.status(400).json({ message: 'Password must be at least 5 characters long.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.none('INSERT INTO users(email, password) VALUES($1, $2)', [email, hash]); // return none because we are not expecting any data back
    res.redirect('/login');
  } catch (error) {
    res.render('pages/register', { message: 'Could not create user.' });
  }
});

app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
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

app.get('/friends', (req, res) => {
  res.render('pages/friends'); // Render login.hbs (assuming it's in views/pages folder)
});
// ------------------------------------
//             Start Server
// ------------------------------------
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');