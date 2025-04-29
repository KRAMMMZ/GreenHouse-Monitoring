// ItemInventoryHook.js

import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

const useItemInventoryData = () => {
    const [itemInventoryData, setItemInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:3001/all-inventory/inventory");
            // Assume the data structure has a key "itemInventoryTable"
            setItemInventoryData(response.data.itemInventoryTable || []);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            setItemInventoryData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for real-time updates on "ItemInventoryData"
        socket.on("ItemInventoryData", (data) => {
            if (data && data.itemInventoryTable) {
                setItemInventoryData(data.itemInventoryTable);
                setLoading(false);
            }
        });

        return () => {
            socket.off("ItemInventoryData");
        };
    }, []);

    return { itemInventoryData, loading };
};

const useItemInventory = ({
    filterOption = "all",
    customFrom = null,
    customTo = null,
    selectedMonth = null,
    selectedYear = null,
    selectedYearly = null,
} = {}) => {
    const [itemInventoryData, setItemInventoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3001/all-inventory/inventory");
                setItemInventoryData(response.data.itemInventoryTable || []);
            } catch (error) {
                console.error("Error fetching item inventory data:", error);
                setItemInventoryData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket.on("ItemInventoryData", (data) => {
            if (data && data.itemInventoryTable) {
                setItemInventoryData(data.itemInventoryTable);
                setLoading(false);
            }
        });

        return () => {
            socket.off("ItemInventoryData");
        };
    }, []);

    const filteredItemInventory = useMemo(() => {
        let filtered = itemInventoryData;

        const filterDate = (item, date) => {
            if (!item.created_at) return false;
            const dateReceived = new Date(item.created_at);
            return (
                dateReceived.getFullYear() === date.getFullYear() &&
                dateReceived.getMonth() === date.getMonth() &&
                dateReceived.getDate() === date.getDate()
            );
        };

        if (filterOption === "currentDay") {
            filtered = filtered.filter(item => filterDate(item, new Date()));
        } else if (filterOption === "last7Days") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(item => {
                if (!item.created_at) return false;
                const dateReceived = new Date(item.created_at);
                return dateReceived >= sevenDaysAgo && dateReceived <= new Date();
            });
        } else if (filterOption === "currentMonth") {
            const today = new Date();
            filtered = filtered.filter(item => {
                if (!item.created_at) return false;
                const dateReceived = new Date(item.created_at);
                return (
                    dateReceived.getMonth() === today.getMonth() &&
                    dateReceived.getFullYear() === today.getFullYear()
                );
            });
        } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
            filtered = filtered.filter(item => {
                if (!item.created_at) return false;
                const dateReceived = new Date(item.created_at);
                return (
                    dateReceived.getMonth() + 1 === Number(selectedMonth) &&
                    dateReceived.getFullYear() === Number(selectedYear)
                );
            });
        } else if (filterOption === "custom" && customFrom && customTo) {
            const fromDate = new Date(customFrom);
            const toDate = new Date(customTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                if (!item.created_at) return false;
                const dateReceived = new Date(item.created_at);
                return dateReceived >= fromDate && dateReceived <= toDate;
            });
        } else if (filterOption === "yearly" && selectedYearly) {
            filtered = filtered.filter(item => {
                if (!item.created_at) return false;
                const dateReceived = new Date(item.created_at);
                return dateReceived.getFullYear() === Number(selectedYearly);
            });
        }

        return filtered;
    }, [itemInventoryData, filterOption, customFrom, customTo, selectedMonth, selectedYear, selectedYearly]);

    return { itemInventory: filteredItemInventory, loading };
};


export { useItemInventory };