import axios from "axios";

const BarChart = async (req, res) => {
  try {
    console.log("Fetching harvests data from external API...");

    // Fetch harvests data from external API
    const response = await axios.get('https://agreemo-api-v2.onrender.com/harvests', {
      headers: {
        'x-api-key': process.env.API_KEY, // Ensure the API key is correctly set in your environment variables
      },
    });
 
    const harvestTable = response.data || [];
    const totalHarvests = harvestTable.length;

    console.log(`Total harvests fetched: ${totalHarvests}`);

    // Aggregate total accepted, rejected, and yield per harvest date
    const harvestsPerDay = harvestTable.reduce((acc, item, index) => {
      const date = new Date(item.harvest_date);
      const formattedDate = `${date.toLocaleString("default", { month: "short" })}${date.getDate()}`;

      

      if (!acc[formattedDate]) {
        acc[formattedDate] = {
          accepted: 0,
          rejected: 0,
          totalYield: 0,
        };
      }

      
      acc[formattedDate].accepted += item.accepted;
      acc[formattedDate].rejected += item.rejected;
      acc[formattedDate].totalYield += item.yield;

       
      return acc;
    }, {});

    // Log the aggregated data
    console.log("Harvests per Day after aggregation:", harvestsPerDay);

    // Convert the aggregated data into an array for the chart
    const formattedData = Object.keys(harvestsPerDay).map((date) => ({
      name: date,
      accepted: harvestsPerDay[date].accepted,
      rejected: harvestsPerDay[date].rejected,
      totalYield: harvestsPerDay[date].totalYield,
    }));

    // Log the formatted data for the response
    console.log('Formatted data for the chart:', formattedData);

    // Return all data in the response
    res.json({
      totalHarvests,
      harvestTable,
      harvestsPerDay: formattedData,
    });

  } catch (error) {
    console.error("Error fetching or processing harvest data:", error.response?.data || error.message);

    // Return error details in the response for debugging
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error',
    });
  }
};

export default BarChart;
