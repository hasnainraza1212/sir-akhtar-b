// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (req.cookies?.accessToken) {
      token = req.cookies?.accessToken;
    }
      if (!token) {
   return  res.status(404).send({
      success: false,
      status: 404,
      message: "Refresh token not found",
    });
  }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, async function(error, decoded){
      if(error){
        return res.status(401).send({status:401, message:`Invalid access token provided. ${error}`, success:false})
      }
      try{
        const user = await User.findById(decoded._id).select("-password ");
        if(!user){
          return res.status(404).send({status:404, message:"MONGOOSE ERROR: Invalid access token provided.", success:false})
        }
        req.user = user
        next();
      }catch(error){
        return res.status(500).json({status:500, message:`Server Error: Something went wrong. ${error}` , success:false})
      }
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      status: 500,
      message: `Server Error: Something went wrong. ${error}`
    });
  }


};

export { protect };
