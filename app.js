const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const hbs = require('hbs');
const { Pool } = require('pg');

dotenv.config()

const pool = new Pool()
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    console.log(result.rows)
  })
})

// import views
const indexRouter = require('./routes/index');
const collectibleRouter = require('./routes/collectible');
const rulesRouter = require('./routes/rules');
const profileRouter = require('./routes/profile');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const quizRouter = require('./routes/quiz');
const quizresultRouter = require('./routes/quizresult');
const forgotpwRouter= require('./routes/forgotpw');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// mount routers
app.use('/', indexRouter);
app.use('/collectible', collectibleRouter); // TODO: Sample route, to be deleted.
app.use('/rules', rulesRouter);
app.use('/profile', profileRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/quiz', quizRouter);
app.use('/quizresult', quizresultRouter);
app.use('/forgotpw', forgotpwRouter);

hbs.registerPartials(path.join(__dirname, '/views/partials')) // register path to partial

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;