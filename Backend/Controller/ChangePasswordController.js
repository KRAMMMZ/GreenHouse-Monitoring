import axios from "axios";

const ChangePassword = async (req, res) => {
    try {
        const { loginId } = req.params;
        const { oldPass, newPass } = req.body;

        if (!loginId || !oldPass || !newPass) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const config = {
            method: 'put',
            url: `https://agreemo-api.onrender.com/admin/${loginId}`, // Ensure correct endpoint format
            headers: {
                "x-api-key": process.env.API_KEY || 'fallback_key',
                "Content-Type": "application/json"
            },
            data: { old_password: oldPass, new_password: newPass },
        };

        const response = await axios(config);
        res.json(response.data);

    } catch (error) {
        console.error('Password change error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Password change failed"
        });
    }
};

export default ChangePassword;
