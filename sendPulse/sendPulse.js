import axios from "axios";

function generateOTP(length=6) {
    let otp = '';
    for (let i = 0; i <= length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

async function sendOtp(phoneNumber, otp) {
    const url = 'https://api.sendpulse.com/sms/send';
    const body = {
        grant_type: 'client_credentials',
        client_id: process.env.SEND_PULSE_ID,
        client_secret: process.env.SEND_PULSE_SECRET
    };

    try {
        const authResponse = await axios.post('https://api.sendpulse.com/oauth/access_token', body);
        const accessToken = authResponse.data.access_token;

        const response = await axios.post(url, {
            phones: [phoneNumber],
            sender: 'studyspace',
            body: `Your OTP is: ${otp}`
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        return { success: true, messageId: response.data.id };
    } catch (error) {
        console.error('Error sending OTP:', error);
        return { success: false, error: error.response.data };
    }
}

export { sendOtp, generateOTP };