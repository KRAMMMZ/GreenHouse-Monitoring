import axios from 'axios';

// Generic handler now accepts a responseKey for data extraction
const handleApiResponse = async (req, res, endpoint, tableName, responseKey = null, errorName) => {
    try {
        const response = await axios.get(endpoint, {
            headers: {
                'x-api-key': process.env.API_KEY,
            },
        });
        // If responseKey is provided, extract the data from that property;
        // otherwise, use the entire response.data.
        const tableData = responseKey ? (response.data[responseKey] || []) : (response.data || []); 

        if (tableData.length === 0) {
            return res.json({ [tableName]: [], message: `No ${errorName} data found.` });
        }

        res.json({ [tableName]: tableData });
    } catch (error) {
        console.error("External API Error:", error.response?.data || error.message);

        if (error.response) {
            res.status(error.response.status).json({
                error: error.response?.data?.error || `External API Error: ${error.response.status} - ${error.message}`
            });
        } else if (error.request) {
            res.status(500).json({ error: 'No response received from external API.' });
        } else {
            res.status(500).json({ error: `Error setting up the request: ${error.message}` });
        }
    }
};

// Each endpoint now passes both the table name and the corresponding response key

export const AdminLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/admin', 
        'AdminLogsTable', 
        'admin_logs',
        'Admin '
    );
};

export const UserLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/user', 
        'UserLogsTable', 
        'user_logs',
         'User '
    );
};

export const HarvestLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/harvest', 
        'harvestLogsTable', 
        'harvest_logs',
         'Harvest'
    );
};

export const RejectionLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/rejection', 
        'RejectionTable', 
        'rejection_logs',
         'Rejection'
    );
};

export const MaintenanceLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/maintenance', 
        'MaintenanceTable', 
        'maintenance_logs',
         'Maintenance'
    );
};

export const HardwareComponentsLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/hardware_components', 
        'hardwareComponentsLogsTable', 
        'logs',
         'Hardware Components'
    );
};

export const ControlsLog = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/control/logsd', 
        'controlsLogTable', 
        'nutrient_controller_logs',
         'Nutrients Control'
    );
};

export const InventoryItemLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/inventory_item', 
        'itemInventoryLogsTable', 
        'inventory_item_logs',
         'Item Inventory'
    );
};
export const NutrientInventoryLogs = async (req, res) => {
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/inventory', 
        'NutrientInventoryLogsTable', 
        'inventory_logs',
         'Nutrient Inventory'
    );
};

export const PlantedCropsLogs = async (req, res) => {
    // If the planted crops endpoint now returns data under a specific property,
    // you can pass that property as the responseKey. Otherwise, it will default to using the full data.
    await handleApiResponse(
        req, 
        res, 
        'https://agreemo-api-v2.onrender.com/activity_logs/planted_crops', 
        'plantedCropsLogsTable',
        'planted_crop_logs',
        'Planted Crops'
    );
};


//export const HardwareStatusLogs = async (req, res) => {
  //  await handleApiResponse(req, res, 'https://agreemo-api-v2.onrender.com/activity_logs/hardware_status', 'hardwareStatusLogsTable');
//};

