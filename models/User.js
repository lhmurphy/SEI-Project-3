const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: 'Please provide your full name'
  },
  lastName: {
    type: String,
    required: 'Please provide your full name'
  },
  username: {
    type: String,
    required: 'Please provide a username',
    unique: 'That username is already registered'
  },
  address: {
    type: String,
    required: 'Please provide your address'
  },
  email: {
    type: String,
    required: 'Please provide and email address',
    unique: 'That email is already registered'
  },
  password: {
    type: String,
    required: 'Please provide a password'
  }
}, {
  toJSON: {
    virtuals: true,
    transform(doc, json) {
      delete json.password
      delete json.__v
      return json
    }
  }
})

userSchema.virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(plaintext) {
    this._passwordConfirmation = plaintext
  })

userSchema.pre('validate', function checkPasswords(next) {
  if(this.isModified('password') && this._passwordConfirmation !== this.password) {
    this.invalidate('passwordConfirmation', 'Passwords do not match')
  }
  next()
})

userSchema.pre('save', function hashPassword(next) {
  if(this.isModified('password')) {

    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8))
  }

  next()
})

userSchema.methods.isPasswordValid = function isPasswordValid(plaintext) {

  return bcrypt.compareSync(plaintext, this.password)
}



module.exports = mongoose.model('User', userSchema)
