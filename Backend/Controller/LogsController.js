import axios from 'axios';

export const AdminLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/admin', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const AdminLogsTable = response.data || [];
    res.json({ AdminLogsTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const UserLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/user', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const UserLogsTable = response.data || [];
    res.json({ UserLogsTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const HarvestLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/harvest', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const harvestLogsTable = response.data || [];
    res.json({ harvestLogsTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const RejectionLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/rejection', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const RejectionTable = response.data || [];
    res.json({ RejectionTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const MaintenanceLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/maintenance', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const MaintenanceTable = response.data || [];
    res.json({ MaintenanceTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const HardwareComponentsLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/hardware_components', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const hardwareComponentsLogsTable = response.data || [];
    res.json({ hardwareComponentsLogsTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const HardwareStatusLogs = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/activity_logs/hardware_status', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const hardwareStatusLogsTable = response.data || [];
    res.json({ hardwareStatusLogsTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};

export const ControlsLog = async (req, res) => {
  try {
    const response = await axios.get('https://agreemo-api-v2.onrender.com/control/logsd', {
      headers: {
        'x-api-key': process.env.API_KEY,
      },
    });
    const controlsLogTable = response.data || [];
    res.json({ controlsLogTable });
  } catch (error) {
    console.error("External API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error'
    });
  }
};
