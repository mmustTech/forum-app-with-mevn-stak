const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. So please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Duplicate field value: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } /* End (A) */

  // B) RENDRED WEBSITE
  console.error('Error  💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Somthing went wrong!',
    msg: err.message
  }); /* End (B) */
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A.1) Operational, trusted errer: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // A.2) Programming or other unknown erroe: don't leak details
    // 1) Log error
    console.error('Error  💥', err);
    // 2) send geniric message
    return res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong!'
    });
  } /* End (A) */

  // B) RENDRED WEBSITE
  // B.1) Operational, trusted errer: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Somthing went wrong!',
      msg: err.message
    });
  }
  // B.2)Programming or other unknown erroe: don't leak details
  // 1) Log error
  console.error('Error  💥', err);
  // 2) send generic message
  return res.status(500).render('error', {
    title: 'Somthing went wrong!',
    msg: 'Please try again later'
  }); /* End (B) */
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  // console.log('i past from here...');

  err.status = err.status || 'Error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
