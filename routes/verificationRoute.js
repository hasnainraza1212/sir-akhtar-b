// routes/authRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";
import { mail } from "../nodeMailer/nodeMailer.js";

const router = express.Router();

router.get("/status", protect, (req, res) => {
  const user = req?.user;
  res.json({
    success: true,
    status: 200,
    user,
    verificationStatus: {
      phoneVerified: user?.phoneVerificationStatus,
      emailVerified: user?.emailVerificationStatus,
    },
  });
});

router.get("/update-status", async (req, res) => {
  try {
    const { _id, emailVerificationStatus, phoneVerificationStatus } = req?.query;

    if (!_id) {
      return res.status(404).json({
        message: "Invalid id provided.",
        success: false,
        status: 404,
      });
    }
    if (emailVerificationStatus === undefined && phoneVerificationStatus === undefined) {
      return res.status(404).json({
        message: "Didn't get any status",
        success: false,
        status: 404,
      });
    }

    try {
      const updateFields = {};
      if (emailVerificationStatus !== undefined) {
        updateFields.emailVerificationStatus = emailVerificationStatus;
      }
      if (phoneVerificationStatus !== undefined) {
        updateFields.phoneVerificationStatus = phoneVerificationStatus;
      }

      const response = await User.findByIdAndUpdate(_id, updateFields, { new: true });

      return res.status(200).json({
        message: "Verification status updated successfully",
        success: true,
        status: 200,
        verificationStatus: response,
      });
    } catch (error) {
   return   res.status(500).json({
        message: `Server Error: ${error.message}`,
        success: false,
        status: 500,
      });
    }
  } catch (error) {
   return res.status(500).json({
      message: `Server Error: ${error.message}`,
      success: false,
      status: 500,
    });
  }
});


export const sendVerificationMail = async(req, res)=>{
  try{

    const user = req?.user
    console.log(user)
    if(!user)
      return res.status(404).json({
        message: `Auth Error: user not found.`,
        success: false,
        status: 404,
      });


      await mail("hr961992@gmail.com" ,user?.email, "Please Verify Your Email.",user?._id, user?.username )
      return res.status(200).json({
        success: true,
        status: 200,
        message:"user fetched successfully.",
        user: req.user,
      });

  }catch(error){
    console.log(error)
   return res.status(500).json({
      message: `Server Error: ${error.message}`,
      success: false,
      status: 500,
    });
  }
}

export default router;
