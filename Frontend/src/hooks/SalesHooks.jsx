// SalesHooks.js

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
        setLoading(true); // Set loading to true before fetching
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

    useEffect(() => {
        fetchData();

        socket.on("salesData", (data) => {
            if (data && data.salesTable) {
                setSalesData(data.salesTable);
                // setLoading(false); // Initial loading is handled by fetchData
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
 */
const useSalesToday = () => {
    const { salesData, loading } = useSalesData();

    const salesToday = useMemo(() => {
        const todayDateStr = getTodayDateString();
        if (!salesData) return 0;
        const todaySales = salesData.filter((item) => {
            if (!item.created_at) return false; // Use created_at
            const salesTime = new Date(item.created_at); // Use created_at
            if (isNaN(salesTime.getTime())) return false; // Invalid date
            const salesDateString = `${salesTime.getFullYear()}-${String(
                salesTime.getMonth() + 1
            ).padStart(2, "0")}-${String(salesTime.getDate()).padStart(2, "0")}`;
            return salesDateString === todayDateStr;
        });
        return todaySales.length;
    }, [salesData]);

    return { salesToday, salesTodayLoading: loading };
};

/**
 * useFilteredSales
 * Returns filtered sales data based on provided filter options.
 */
const useFilteredSales = ({
    filterOption = "all",
    customFrom = null,
    customTo = null,
    selectedMonth = null,
    selectedYear = null,
    selectedYearly = null,
} = {}) => {
    // Use useSalesData to ensure data is fetched and updated consistently
    const { salesData: allSalesData, loading: dataLoading } = useSalesData();

    const filteredSales = useMemo(() => {
        if (!allSalesData || allSalesData.length === 0) return [];
        let filtered = allSalesData;

        const getSaleDate = (item) => {
            if (!item.created_at) return null;
            const date = new Date(item.created_at);
            return isNaN(date.getTime()) ? null : date;
        };

        if (filterOption === "currentDay") {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            
            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= todayStart && salesTime <= todayEnd;
            });
        } else if (filterOption === "last7Days") {
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const sevenDaysAgoStart = new Date();
            // Includes today as the 7th day. So, today and 6 previous days.
            sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6); 
            sevenDaysAgoStart.setHours(0, 0, 0, 0);
            
            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= sevenDaysAgoStart && salesTime <= todayEnd;
            });
        } else if (filterOption === "currentMonth") {
            const today = new Date();
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
            const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= currentMonthStart && salesTime <= currentMonthEnd;
            });
        } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
            // Ensure selectedMonth and selectedYear are numbers
            const month = Number(selectedMonth);
            const year = Number(selectedYear);

            const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
            const monthEnd = new Date(year, month, 0, 23, 59, 59, 999); // Day 0 of next month is last day of current

            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= monthStart && salesTime <= monthEnd;
            });
        } else if (filterOption === "custom" && customFrom && customTo) {
            const fromDate = new Date(customFrom);
            fromDate.setHours(0, 0, 0, 0); 
            const toDate = new Date(customTo);
            toDate.setHours(23, 59, 59, 999);

            if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return filtered;

            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= fromDate && salesTime <= toDate;
            });
        } else if (filterOption === "yearly" && selectedYearly) {
            const year = Number(selectedYearly);
            const yearStart = new Date(year, 0, 1, 0, 0, 0, 0); 
            const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

            filtered = filtered.filter(item => {
                const salesTime = getSaleDate(item);
                if (!salesTime) return false;
                return salesTime >= yearStart && salesTime <= yearEnd;
            });
        }
  
        return filtered;
    }, [allSalesData, filterOption, customFrom, customTo, selectedMonth, selectedYear, selectedYearly]);
  
    return { filteredSales, loading: dataLoading }; // Use loading from useSalesData
};
  
export {
    useSales,
    useSalesToday,
    useFilteredSales
};