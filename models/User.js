import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'user',
    },
    phoneVerificationStatus:{
      type:Boolean,
      default:true
    },
    emailVerificationStatus:{
      type:Boolean,
      default:false
    },
    refreshToken:{
      type:String,
      default:""
    }
  });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.generateAccessToken=async function(){
  const user = this.toObject();
  delete user.password
  delete user.refreshToken
  const accessToken = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn:"30d"})
  return accessToken

}
userSchema.methods.generateRefreshToken=async function(){
  const user = this.toObject()
  delete user.password
  delete user.refreshToken
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_TOKEN_SECRET, {expiresIn:"365d"})
  return refreshToken

}
const User = mongoose.model('User', userSchema);

export default User;