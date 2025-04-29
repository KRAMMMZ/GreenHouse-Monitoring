import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

// Utility: Get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * useSalesData
 * Fetches sales data once and listens for real-time updates via Socket.IO.
 */
const useSalesData = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:3001/sales");
            // Assume the API returns an array of sales records directly
            setSalesData(response.data.salesTable || []);
        } catch (error) {
            console.error("Error fetching sales data:", error);
            setSalesData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for real-time updates on "salesData"
        socket.on("salesData", (data) => {
            if (data && data.salesTable) {
                setSalesData(data.salesTable);
                setLoading(false);
            }
        });

        return () => {
            socket.off("salesData");
        };
    }, []);

    return { salesData, loading };
};

/**
 * useSales
 * Returns the sales data and a loading state.
 */
const useSales = () => {
    const { salesData, loading } = useSalesData();
    return { sales: salesData, salesLoading: loading };
};

/**
 * useSalesToday
 * Returns the count of sales records with a salesDate of today.
 * Assumes each record has a "salesDate" field.
 */
const useSalesToday = () => {
    const { salesData, loading } = useSalesData();

    const salesToday = useMemo(() => {
        const todayDate = getTodayDateString();
        const todaySales = salesData.filter((item) => {
            if (!item.salesDate) return false;
            const salesTime = new Date(item.salesDate);
            const salesDateString = `${salesTime.getFullYear()}-${String(
                salesTime.getMonth() + 1
            ).padStart(2, "0")}-${String(salesTime.getDate()).padStart(2, "0")}`;
            return salesDateString === todayDate;
        });
        return todaySales.length;
    }, [salesData]);

    return { salesToday, salesTodayLoading: loading };
};

/**
 * useFilteredSales
 * Returns filtered sales data based on provided filter options.
 *
 * @param {object} options - Filtering options:
 *    filterOption: "all" | "currentDay" | "last7Days" | "currentMonth" | "selectMonth" | "custom"
 *    customFrom: start date for custom filtering.
 *    customTo: end date for custom filtering.
 *    selectedMonth: month number for "selectMonth".
 *    selectedYear: year number for "selectMonth".
 *    selectedYearly: year number for "yearly".
 *
 * Assumes each record has a "salesDate" field.
 */
const useFilteredSales = ({
    filterOption = "all",
    customFrom = null,
    customTo = null,
    selectedMonth = null,
    selectedYear = null,
    selectedYearly = null,
} = {}) => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3001/sales");
                setSalesData(response.data.salesTable || []);
            } catch (error) {
                console.error("Error fetching sales data:", error);
                setSalesData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket.on("salesData", (data) => {
            if (data && data.salesTable) {
                setSalesData(data.salesTable);
                setLoading(false);
              }
          });
  
          return () => {
              socket.off("salesData");
          };
      }, []);
  
      const filteredSales = useMemo(() => {
          let filtered = salesData;
  
          const filterDate = (item, date) => {
              if (!item.salesDate) return false;
              const salesTime = new Date(item.salesDate);
              return (
                  salesTime.getFullYear() === date.getFullYear() &&
                  salesTime.getMonth() === date.getMonth() &&
                  salesTime.getDate() === date.getDate()
              );
          };
  
          if (filterOption === "currentDay") {
              filtered = filtered.filter(item => filterDate(item, new Date()));
          } else if (filterOption === "last7Days") {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              filtered = filtered.filter(item => {
                  if (!item.salesDate) return false;
                  const salesTime = new Date(item.salesDate);
                  return salesTime >= sevenDaysAgo && salesTime <= new Date();
              });
          } else if (filterOption === "currentMonth") {
              const today = new Date();
              filtered = filtered.filter(item => {
                  if (!item.salesDate) return false;
                  const salesTime = new Date(item.salesDate);
                  return (
                      salesTime.getMonth() === today.getMonth() &&
                      salesTime.getFullYear() === today.getFullYear()
                  );
              });
          } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
              filtered = filtered.filter(item => {
                  if (!item.salesDate) return false;
                  const salesTime = new Date(item.salesDate);
                  return (
                      salesTime.getMonth() + 1 === Number(selectedMonth) &&
                      salesTime.getFullYear() === Number(selectedYear)
                  );
              });
          } else if (filterOption === "custom" && customFrom && customTo) {
              const fromDate = new Date(customFrom);
              const toDate = new Date(customTo);
              toDate.setHours(23, 59, 59, 999); // Include the entire end day
              filtered = filtered.filter(item => {
                  if (!item.salesDate) return false;
                  const salesTime = new Date(item.salesDate);
                  return salesTime >= fromDate && salesTime <= toDate;
              });
          } else if (filterOption === "yearly" && selectedYearly) {
              filtered = filtered.filter(item => {
                  if (!item.salesDate) return false;
                  const salesTime = new Date(item.salesDate);
                  return salesTime.getFullYear() === Number(selectedYearly);
              });
          }
  
          return filtered;
      }, [salesData, filterOption, customFrom, customTo, selectedMonth, selectedYear, selectedYearly]);
  
      return { filteredSales, loading };
  };
  
  export {
      useSales,
      useSalesToday,
      useFilteredSales
  };