// SendEmailController.js
import axios from "axios";
import qs from "qs";

const SendEmail = async (req, res) => {  
  try {
    // Expect req.body.email to be a string of comma-separated emails.
    const { email } = req.body;
    // Clean the email string: split by comma, trim each email, then rejoin.
    const cleanedEmails = email.split(",").map(e => e.trim()).join(",");
    const data = qs.stringify({ email: cleanedEmails });
    
    const config = {
      method: 'post',
      url: 'https://agreemo-api.onrender.com/apk-link-sender',
      maxBodyLength: Infinity,
      headers: { 
        'x-api-key': process.env.API_KEY || "fallback_key",
      },
      data: data,
    };

    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).json({ error: error.message });
  }
};

export default SendEmail;
