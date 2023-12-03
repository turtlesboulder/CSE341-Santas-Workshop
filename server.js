const dotenv = require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();
const passport = require('passport');
const githubPassportStrategy = require("passport-github2").Strategy;

const swaggerAutogen = require('swagger-autogen')();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app
  .use(express.urlencoded({ extended: true }))
  .use(express.json());

app
  .use(session({
    secret: "secret", //setting up a cookie, this is the name of that session cookie. 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // for HTTPS, set `secure: true`
}));

app
  // basic express session initialization
  .use(passport.initialize())
  // init passport on every route call - tying it to the session
  .use(passport.session())
  // allow passport to use 'express-session'
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Z-Key, Authorization"
    );
    next();
});

app
  .use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS']
}))

app
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  .use('/', require('./routes/index.js'));

passport.use(new GitHubStrategy ({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
}, function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ github: profile.id}, function(err, user) {    this is how we would link to our mongo database
    // console.log(profile)
    return done(null, profile);
    //});
  }
));

const db = require('./models');
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});