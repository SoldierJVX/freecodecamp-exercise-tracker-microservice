const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
const Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log("Connection Successful!");
});

const userSchema = new Schema({
  username: { type: String },
  exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
});

const exerciceSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User'}, 
  description: { type: String, required: true },
  duration: Number,
  date: Date
});

var Exercise = mongoose.model("Exercise", exerciceSchema);
var User = mongoose.model("User", userSchema);

var createAndSaveUser = (done, username) => {
  User.findOne({'username': username }, (err, user) =>{
    if (err) return console.error(err);
    if(!user){
      const me = new User({username: username});
      me.save(function(err, data) {
        if (err) return console.error(err);
        done(null, data)
      });
    } else {
      done(null, user)
    }
  })
};

var createAndSaveExercise = (done, exercise) => {
  if(exercise.date == null) exercise.date = new Date()
  else exercise.date = new Date(exercise.date)
  const me = new Exercise(exercise)
  
  me.save(function(err, data) {
    if (err) return console.error(err);
    User.findById(exercise.userId).populate('Exercise').exec((err, user) =>{
    if (err) return console.error(err);
      done(null, user)
    })
  })
}

var listUsers = (done) => {
  User.find({}, (err, users) => {
    if (err) return console.error(err);
    var lstUser = [];
    users.forEach((user) => {
      lstUser.push(user)
    });
    done(null, lstUser);  
  })
}

var findUserById = (userId, done) => {
  User.findById(userId , function (err, data) {
    if (err) return console.error(err);
    done(null, data);
  });
};

var findExerciseById = (exerciseId, done) => {
  Exercise.findById(exerciseId , function (err, data) {
    if (err) return console.error(err);
    done(null, data);
  });
};

exports.createAndSaveUser = createAndSaveUser
exports.createAndSaveExercise = createAndSaveExercise
exports.findUserById = findUserById
exports.findExerciseById = findExerciseById
exports.listUsers = listUsers

exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.mongoose = mongoose