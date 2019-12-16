const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

// global setting for safety timeouts to handle possible
// wrong callbacks that will never be called
var timeout = 10000;

var User = require('./myApp.js').UserModel;

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

var createUser = require('./myApp.js').createAndSaveUser;
app.post('/api/exercise/new-user', (req, res, next) => {
  // in case of incorrect function use wait timeout then respond
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  createUser((err, data) => {
    clearTimeout(t);
    if(err) { return (next(err)); }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    }
     res.json(data);
  }, req.body.username);
})

var listUsers = require('./myApp.js').listUsers;
app.get('/api/exercise/users', (req, res, next) => {
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  listUsers( (err, data) => {
    var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
    clearTimeout(t);
    if(err) { return (next(err)); }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    }
    res.json(data);
  })
});

var createExercise = require('./myApp.js').createAndSaveExercise;
app.post('/api/exercise/add', (req, res, next) => {
  // in case of incorrect function use wait timeout then respond
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  createExercise((err, data) => {
    clearTimeout(t);
    if(err) { return (next(err)); }
    if(!data) {
      console.log('Missing `done()` argument');
      return next({message: 'Missing callback argument'});
    }
     res.json(data);
  }, req.body);
})

var mongoose = require('./myApp.js').mongoose;
app.get('/is-mongoose-ok', (req, res) => {
  if (mongoose) {
    res.json({isMongooseOk: !!mongoose.connection.readyState})
  } else {
    res.json({isMongooseOk: false})
  }
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})