import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");
// Use your API base URL (consider using an environment variable)
const baseUrl = "http://localhost:3001";

export const useActivityLogs = () => {
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const [harvestLogs, setHarvestLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [rejectionLogs, setRejectionLogs] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [hardwareComponentsLogs, setHardwareComponentsLogs] = useState([]);
  // const [hardwareStatusLogs, setHardwareStatusLogs] = useState([]); //hardwareStatusLogs REMOVED
  const [controlsLog, setControlsLog] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [plantedCropsLogs, setPlantedCropsLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  // Store errors as an object to keep track of which route failed
  const [error, setError] = useState({});
  // Store empty states to show custom message if data is not available
  const [emptyData, setEmptyData] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchLogs = async () => {
      // Initiate all requests concurrently with Promise.allSettled
      const results = await Promise.allSettled([
        axios.get(`${baseUrl}/logs/admin`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/user`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/rejection`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/maintenance`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/harvest`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/hardware_components`, {
          signal: controller.signal,
        }),
        // axios.get(`${baseUrl}/logs/hardware_status`, { //hardwareStatusLogs REMOVED
        //   signal: controller.signal,
        // }),
        axios.get(`${baseUrl}/logs/control/logsd`, {
          signal: controller.signal,
        }),
        axios.get(`${baseUrl}/logs/inventory`, { signal: controller.signal }),
        axios.get(`${baseUrl}/logs/planted_crops`, {
          signal: controller.signal,
        }),
      ]);

      // Reset the error object before processing
      setError({});
      // Reset the emptyData object before processing
      setEmptyData({});

      const processResult = (result, setData, dataKey) => {
        if (result.status === "fulfilled") {
          if (result.value.data[dataKey]?.length > 0) {
            setData(result.value.data[dataKey]);
          } else {
            setData([]); // Set to empty array
            // Check for an explicit 'message' property in the response
            if (result.value.data.message) {
              setEmptyData((prev) => ({
                ...prev,
                [dataKey]: result.value.data.message,
              }));
            } else {
              setEmptyData((prev) => ({
                ...prev,
                [dataKey]: `No ${dataKey} data found.`,
              }));
            }
          }
        } else {
          setError((prev) => ({
            ...prev,
            [dataKey]: "Failed to fetch " + dataKey + " data",
          }));
        }
      };

      processResult(results[0], setAdminActivityLogs, "AdminLogsTable");
      processResult(results[1], setUserActivityLogs, "UserLogsTable");
      processResult(results[2], setRejectionLogs, "RejectionTable");
      processResult(results[3], setMaintenanceLogs, "MaintenanceTable");
      processResult(results[4], setHarvestLogs, "harvestLogsTable");
      processResult(
        results[5],
        setHardwareComponentsLogs,
        "hardwareComponentsLogsTable"
      );
      // processResult( //hardwareStatusLogs REMOVED
      //   results[6],
      //   setHardwareStatusLogs,
      //   "hardwareStatusLogsTable"
      // );
      processResult(results[6], setControlsLog, "controlsLogTable");
      processResult(results[7], setInventoryLogs, "itemInventoryLogsTable");
      processResult(results[8], setPlantedCropsLogs, "plantedCropsLogsTable");
    };

    fetchLogs()
      .catch((err) => {
        console.error("Unexpected error: ", err);
      })
      .finally(() => {
        setLogsLoading(false);
      });

    // Define the event handler for real-time updates
    const handleActivityLogsData = (data) => {
      if (data) {
        setAdminActivityLogs(data.AdminLogsTable || []);
        setUserActivityLogs(data.UserLogsTable || []);
        setRejectionLogs(data.RejectionTable || []);
        setMaintenanceLogs(data.MaintenanceTable || []);
        setHarvestLogs(data.harvestLogsTable || []);
        setHardwareComponentsLogs(data.hardwareComponentsLogsTable || []);
        // setHardwareStatusLogs(data.hardwareStatusLogsTable || []); //hardwareStatusLogs REMOVED
        setControlsLog(data.controlsLogTable || []);
        setInventoryLogs(data.itemInventoryLogsTable || []);
        setPlantedCropsLogs(data.plantedCropsLogsTable || []);
      }
    };

    // Listen for real-time updates via Socket.IO on "ActivityLogsData"
    socket.on("ActivityLogsData", handleActivityLogsData);

    // Clean-up function: abort the request and remove the socket listener
    return () => {
      controller.abort();
      socket.off("ActivityLogsData", handleActivityLogsData);
    };
  }, []);

  return {
    adminActivityLogs,
    userActivityLogs,
    rejectionLogs,
    maintenanceLogs,
    harvestLogs,
    hardwareComponentsLogs,
    // hardwareStatusLogs, //hardwareStatusLogs REMOVED
    controlsLog,
    inventoryLogs,
    plantedCropsLogs,
    logsLoading,
    error,
    emptyData, // Add emptyData to the return value
  };
};