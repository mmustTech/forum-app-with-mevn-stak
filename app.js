const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const serveStatic = require("serve-static");

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const topicRouter = require('./routes/topicRoutes');
const commentRouter = require('./routes/commentRoutes');
const catergoryRouter = require('./routes/catergoryRoutes');
const thumbsTouter = require('./routes/thumbsRoutes');

const app = express();

// Setting up Pug in express
app.use(cors({
  credentials: true,
  origin: 'http://localhost:8080'
}));  //enable cors

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use("/static", express.static(path.join(__dirname, 'static')));
// app.use(express.static(path.join(__dirname, './../frontend/dist')));
// app.use(serveStatic(path.join(__dirname, './../frontend/dist')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API
const limiter = rateLimit({
  max: (500),
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent params pollution
// app.use(
//   hpp({
//     whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
//   })
// );

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) API ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/topics', topicRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/thumbs', thumbsTouter);
app.use('/api/v1/categories', catergoryRouter);


// 4) Deploy Public File

console.log(new Date(Date.now() + 10 * 1000));

if(process.env.NODE_ENV === 'development') { /*production*/ }
app.use(express.static(__dirname + '/public/')); // Public Vue.js files
app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html')); // Handle SPA of Vue.js URL



app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!.`, 404));
});

app.use(globalErrorHandler);

// export APP module
module.exports = app;
