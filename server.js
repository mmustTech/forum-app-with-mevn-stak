const mongoose = require('mongoose');
const dotenv = require('dotenv');

/* Catch Code Execution Error */
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

/* Get 'config.env' Varibales */
dotenv.config({ path: './config.env' });

/* Import 'app.js' Main Application File */
const app = require('./app');

/* Connect To MongoDB Atlas: Database of Application */
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful'));

/* Create & Run The Application */
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running in port ${port}`);
});

// console.log(con.connections);
// console.log(process.env);

/* Catch Rejected Promises OUTSIDE Of App. (ex: connection with mongoose) */
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
