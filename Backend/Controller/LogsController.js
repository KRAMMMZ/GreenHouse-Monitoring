import axios from 'axios';

const handleApiResponse = async (req, res, endpoint, tableName) => {
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'x-api-key': process.env.API_KEY,
            },
        });
        const tableData = response.data || [];

        if (tableData.length === 0) {
            // Explicitly indicate no data found
            return res.json({ [tableName]: [], message: `No ${tableName} data found.` });
        }

        res.json({ [tableName]: tableData });

    } catch (error) {
        console.error("External API Error:", error.response?.data || error.message);

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({
                error: error.response?.data?.error || `External API Error: ${error.response.status} - ${error.message}`
            });
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ error: 'No response received from external API.' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: `Error setting up the request: ${error.message}` });
        }
    }
};

export const AdminLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/admin', 'AdminLogsTable');
};

export const UserLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/user', 'UserLogsTable');
};

export const HarvestLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/harvest', 'harvestLogsTable');
};

export const RejectionLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/rejection', 'RejectionTable');
};

export const MaintenanceLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/maintenance', 'MaintenanceTable');
};

export const HardwareComponentsLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/hardware_components', 'hardwareComponentsLogsTable');
};

//export const HardwareStatusLogs = async (req, res) => {
  //  await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/hardware_status', 'hardwareStatusLogsTable');
//};

export const ControlsLog = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/control/logsd', 'controlsLogTable');
};


export const InventoryItemLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/inventory', 'itemInventoryLogsTable');
};


export const PlantedCropsLogs = async (req, res) => {
    await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/planted_crops', 'plantedCropsLogsTable');
};