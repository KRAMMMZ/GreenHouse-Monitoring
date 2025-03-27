import axios from "axios";

const totalRejectionsPerDay = async (req, res) => {
  try {
    const response = await axios.get("https://agreemo-api-v2.onrender.com/reason_for_rejection", {
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });

    // Ensure the correct structure is returned
    const rejectedTable = response.data.rejectedTable || [];
    const totalReject = response.data.totalReject || 0;

    res.json({
      rejectedTable,
      totalReject,
    });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
};

export default totalRejectionsPerDay;
