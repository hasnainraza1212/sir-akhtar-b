import nodemailer from 'nodemailer';
const host="https://study-space-akhtar-raza.vercel.app"
// const host="http://localhost:5173"

// Function to generate the email content
const content = (id = "", username = "") => `
<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
    <div style="background-color: #ffffff; width: 600px; border: 1px solid #dddddd; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #000000; padding: 20px; text-align: left;">
            <img src="https://firebasestorage.googleapis.com/v0/b/galileology.appspot.com/o/logo.png?alt=media" alt="Vonage Logo" style="max-width: 150px;">
        </div>
        <div style="padding: 20px;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Verify your email address</h1>
            <p style="color: #555555; line-height: 1.6;">Hi ${username},</p>
            <p style="color: #555555; line-height: 1.6;">Please confirm that you want to use this email address with your Study Space account. If you did not request this, then feel free to ignore this email.</p>
            <a href="${host}/verify-email?_id=${id}&username=${username}&emailVerificationStatus=true"  data-id="${id}" style="display: inline-block; margin: 20px 0; padding: 10px 20px; color: #ffffff; background-color: #333333; text-decoration: none; border-radius: 5px;">Verify new email address</a>
            <p style="color: #555555; line-height: 1.6;">Regards,<br>The Study Space Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p>Study Space, University Road, • Gulshan e Iqbal, Karachi.</p>
            <p>You received this because you're a registered Study Space user. Do not reply</p>
            <p>Questions? Check out the <a href="${host}" style="color: #717171; text-decoration: none;">docs</a> or find help from <a href="${host}" style="color: #717171; text-decoration: none;">support</a>.</p>
        </div>
    </div>
</div>
`;



const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD
    }
});

export async function mail(from, to, subject, userId, username) {
    try {
        const emailContent = content(userId, username);
        const info = await transporter.sendMail({
            from: from, 
            to: to, 
            subject: subject, 
            html: emailContent,
        });
        
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error('Error sending email:', err);
        return err;
    }
}
