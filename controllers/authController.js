import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fetch from "node-fetch"
dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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
    const isHuman = await verifyRecaptchaToken(token);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'reCAPTCHA verification failed',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'User already exists',
      });
    }

    const user = await User.create({ username, email, password });

    if (user) {
      res.status(201).json({
        success: true,
        status: 201,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
        },
        token: generateToken(user._id),
        message:"Signup successfully."
      });
    } else {
      res.status(400).json({
        success: false,
        status: 400,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    res.status(500).json({
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
    const isHuman = await verifyRecaptchaToken(token);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'reCAPTCHA verification failed',
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        status: 200,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
        },
        token: generateToken(user._id),
        message:"Login successfully."
      });
    } else {
      res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};
