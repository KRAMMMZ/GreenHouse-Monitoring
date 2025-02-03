import { useState, useEffect } from "react";
import axios from "axios";
import { useHarvestItems } from "./TotalHarvestHooks";

const useAcceptedChart = () => {
    const [harvestData, setHarvestData] = useState([]);
  
    const { harvestItems } = useHarvestItems();
  
    useEffect(() => {
      // Group by harvest date and calculate total accepted for each date
      const calculateTotalAcceptedPerDay = () => {
        const groupedData = harvestItems.reduce((acc, item) => {
          const date = new Date(item.harvest_date);
          const formattedDate = `${date.toLocaleString("default", { month: "short" })}${date.getDate()}`;
  
          if (!acc[formattedDate]) {
            acc[formattedDate] = 0;
          }
          acc[formattedDate] += item.accepted; // Sum accepted values
  
          return acc;
        }, {});
  
        // Convert the grouped data into an array for use in charts or displays
        const formattedData = Object.keys(groupedData).map((date) => ({
          name: date,
          value: groupedData[date],
        }));
  
        setHarvestData(formattedData);
      };
  
      if (harvestItems.length > 0) {
        calculateTotalAcceptedPerDay();
      }
    }, [harvestItems]);
  
    return harvestData;
  };
 

// Hook to calculate total rejected per day
const useRejectedChart = () => {
    const [rejectedData, setRejectedData] = useState([]);
    const { harvestItems } = useHarvestItems();
  
    useEffect(() => {
      // Group by harvest date and calculate total rejected for each date
      const calculateTotalRejectedPerDay = () => {
        const groupedData = harvestItems.reduce((acc, item) => {
          const date = new Date(item.harvest_date);
          const formattedDate = `${date.toLocaleString("default", { month: "short" })}${date.getDate()}`;
  
          if (!acc[formattedDate]) {
            acc[formattedDate] = 0;
          }
          acc[formattedDate] += item.total_rejected; // Sum rejected values
  
          return acc;
        }, {});
  
        // Convert the grouped data into an array for use in charts or displays
        const formattedData = Object.keys(groupedData).map((date) => ({
          name: date,
          value: groupedData[date],
        }));
  
        setRejectedData(formattedData);
      };
  
      if (harvestItems.length > 0) {
        calculateTotalRejectedPerDay();
      }
    }, [harvestItems]);
  
    return rejectedData;
  };
  
  // Hook to calculate total yield per day
  const useYieldChart = () => {
    const [yieldData, setYieldData] = useState([]);
    const { harvestItems } = useHarvestItems();
  
    useEffect(() => {
      // Group by harvest date and calculate total yield for each date
      const calculateTotalYieldPerDay = () => {
        const groupedData = harvestItems.reduce((acc, item) => {
          const date = new Date(item.harvest_date);
          const formattedDate = `${date.toLocaleString("default", { month: "short" })}${date.getDate()}`;
  
          if (!acc[formattedDate]) {
            acc[formattedDate] = 0;
          }
          acc[formattedDate] += item.total_yield; // Sum yield values
  
          return acc;
        }, {});
  
        // Convert the grouped data into an array for use in charts or displays
        const formattedData = Object.keys(groupedData).map((date) => ({
          name: date,
          value: groupedData[date],
        }));
  
        setYieldData(formattedData);
      };
  
      if (harvestItems.length > 0) {
        calculateTotalYieldPerDay();
      }
    }, [harvestItems]);
  
    return yieldData;
  };
  
  export { useAcceptedChart, useRejectedChart, useYieldChart };