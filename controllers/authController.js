import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fetch from "node-fetch"
import { generateOTP, sendOtp } from '../sendPulse/sendPulse.js';
import { mail } from '../nodeMailer/nodeMailer.js';
dotenv.config();

// Function to verify reCAPTCHA token
const verifyRecaptchaToken = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return false;
  }
};


export const registerUser = async (req, res) => {
  const { username, email, password, token } = req.body;

  try {
    // Verify reCAPTCHA token
    // const isHuman = await verifyRecaptchaToken(token);
    // if (!isHuman) {
    //   return res.status(400).json({
    //     success: false,
    //     status: 400,
    //     message: 'reCAPTCHA verification failed',
    //   });
    // }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'User already exists',
      });
    }

    const user = await User.create({ username, email, password });
    const refreshToken = await user.generateRefreshToken()
    const accessToken =await user.generateAccessToken()
    user.refreshToken = refreshToken
    user.accessToken = accessToken
   await user.save({ validateBeforeSave: false });

  //  const messagesent =await  sendOtp("+923172922032", generateOTP())
  console.log("user", user)
    if (user) {
      res.status(201).json({
        success: true,
        status: 201,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
          emailVerificationStatus:user.emailVerificationStatus,
          phoneVerificationStatus:user.phoneVerificationStatus
        },
        refreshToken:user.refreshToken,
        accessToken:user.accessToken,
        message:"Signup successfully."
      });
      // console.log(messagesent)
      return  await mail("hr961992@gmail.com" ,user?.email, "Please Verify Your Email.",user?._id, user?.username )
    } else {
    return  res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
   return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};


export const authUser = async (req, res) => {
  const { email, password, token } = req.body;

  try {
    // Verify reCAPTCHA token
    // const isHuman = await verifyRecaptchaToken(token);
    // if (!isHuman) {
    //   return res.status(400).json({
    //     success: false,
    //     status: 400,
    //     message: 'reCAPTCHA verification failed',
    //   });
    // }

    const user = await User.findOne({ email });
    if (!user){
      return res.status(404).json({
        success: false,
        status: 404,
        message:"user not found."
    })
  }
    const isPasswordMatched = await user?.matchPassword(password)

    if (user && isPasswordMatched) {
      if (!user.emailVerificationStatus){
       await mail("hr961992@gmail.com" ,user?.email, "Please Verify Your Email.",user?._id, user?.username )
      }
      const refreshToken= await user.generateRefreshToken()
      const accessToken = await user.generateAccessToken()
      user.refreshToken = refreshToken;
      user.accessToken = accessToken;
   await user.save({ validateBeforeSave: false });
     return res.status(200).json({
        success: true,
        status: 200,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
          emailVerificationStatus:user.emailVerificationStatus,
          phoneVerificationStatus:user.phoneVerificationStatus
        },
        refreshToken :refreshToken,
        accessToken :accessToken,
        message:"Login successfully."
      });
    } else {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
   return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

export const refreshAccessToken= (req, res)=>{
try{
  const {refreshToken} = req.body
  if(!refreshToken){
    return res.status(403).send({status:403, message:"Refresh token not provided."})
  }
  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async function(error, decoded){
    if(error){
      return res.status(403).send({status:403, message:"JWT ERROR: Invalid Refresh token provided.", success:false})
    }
    let user =await User.findOne({email:decoded?.email}).select("-password")
    if(!user){
      return res.status(403).send({status:403, message:"MONGOOSE ERROR: Invalid refresh token provided."})
    }
    if(refreshToken !== user?.refreshToken){
      return res.status(403).send({status:403, message:"MONGOOSE AND JWT ERROR:Invalid refresh token provided, provided token doesn't match with Mongoose Token.", success:false})
    }
    user = user.toObject() 
    delete user.accessToken
    delete user.refreshToken
    const accessToken = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn:"3m"})
    return res.status(200).send({status:200, message:"Access token refreshed successfully.", success:true, accessToken})
  })

}catch(error){
  return res.status(500).send({status:500,message:"Internal server error", success:false })
}
}

export const deleteUser = async (req, res) => {
  try {
    const { _id } = req?.user;
    if (!_id) {
      return res.status(403).send({ status: 403, message: "_id not found." });
    }

    const deleteUser = await User.findByIdAndDelete(_id);
    if (!deleteUser) {
      return res.status(400).json({
        status: 400,
        message: "Failed to delete the user."
      });
    }
    return res.status(200).json({
      status: 200,
      message: "User deleted successfully.",
      user: deleteUser
    });
  } catch (error) {
    return res.status(500).send({ status: 500, message: "Internal server error", success: false });
  }
};

  