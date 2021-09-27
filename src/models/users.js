const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const sharp = require('sharp')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//virtual properties, it allow us to create a relationship
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

//Getting public profile details
//.getPublicProfile =  function(){
    userSchema.methods.toJSON =  function(){
    const user = this
    const userobject = user.toObject()

    delete userobject.password
    delete userobject.tokens
    delete userobject.avatar
    return userobject
}

//generating token
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
//concatinating the token to the user informations
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

//Validating inputted credentials
userSchema.statics.FindByCredential = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to Login')
    }

    return user
}


//Hash the Plain text password before saving
userSchema.pre('save', async function (next){
    const user = this
    //Check if Password is modify
    if(user.isModified('password')){
       user.password =  await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User