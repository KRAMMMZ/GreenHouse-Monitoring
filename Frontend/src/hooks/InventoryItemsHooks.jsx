// InventoryItemsHook.js

import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

// Create a single socket connection instance
const socket = io("http://localhost:3001");

const useInventoryItemsData = () => {
    const [inventoryItemsData, setInventoryItemsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:3001/inventory_items");
            // Assume the data structure has a key "inventory_items"
            setInventoryItemsData(response.data.all_inventoryTable || []);
        } catch (error) {
            console.error("Error fetching inventory items data:", error);
            setInventoryItemsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for real-time updates on "inventoryItemsData"
        socket.on("inventoryItemsData", (data) => {
            if (data && data.all_inventoryTable) {
                setInventoryItemsData(data.all_inventoryTable);
            }
            setLoading(false);
        });

        return () => {
            socket.off("inventoryItemsData");
        };
    }, []);

    return { inventoryItemsData, loading };
};

const useInventoryItems = () => {
    const { inventoryItemsData, loading } = useInventoryItemsData();
    return { inventoryItems: inventoryItemsData, inventoryItemsLoading: loading };
};

const useInventoryItemsToday = () => {
    const { inventoryItemsData, loading } = useInventoryItemsData();
    const todayString = new Date().toISOString().split("T")[0];

    const itemsToday = useMemo(() => {
        return inventoryItemsData.filter((item) => {
            return item.date_received && item.date_received.startsWith(todayString);
        }).length;
    }, [inventoryItemsData, todayString]);

    return { inventoryItemsToday: itemsToday, inventoryItemsTodayLoading: loading };
};

const useFilteredInventoryItems = ({
    filterOption = "all",
    customFrom = null,
    customTo = null,
    selectedMonth = null,
    selectedYear = null,
    selectedYearly = null,
} = {}) => {
    const [inventoryItemsData, setInventoryItemsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3001/inventory_items");
                setInventoryItemsData(response.data.all_inventoryTable || []);
            } catch (error) {
                console.error("Error fetching inventory items data:", error);
                setInventoryItemsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket.on("inventoryItemsData", (data) => {
            if (data && data.all_inventoryTable) {
                setInventoryItemsData(data.all_inventoryTable);
            }
            setLoading(false);
        });
        return () => {
            socket.off("inventoryItemsData");
        };
    }, []);

    const filteredInventoryItems = useMemo(() => {
        let filtered = inventoryItemsData;

        const filterDate = (item, date) => {
            if (!item.date_received) return false;
            const dateReceived = new Date(item.date_received);
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
                if (!item.date_received) return false;
                const dateReceived = new Date(item.date_received);
                return dateReceived >= sevenDaysAgo && dateReceived <= new Date();
            });
        } else if (filterOption === "currentMonth") {
            const today = new Date();
            filtered = filtered.filter(item => {
                if (!item.date_received) return false;
                const dateReceived = new Date(item.date_received);
                return (
                    dateReceived.getMonth() === today.getMonth() &&
                    dateReceived.getFullYear() === today.getFullYear()
                );
            });
        } else if (filterOption === "selectMonth" && selectedMonth && selectedYear) {
            filtered = filtered.filter(item => {
                if (!item.date_received) return false;
                const dateReceived = new Date(item.date_received);
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
                if (!item.date_received) return false;
                const dateReceived = new Date(item.date_received);
                return dateReceived >= fromDate && dateReceived <= toDate;
            });
        }
        else if (filterOption === "yearly" && selectedYearly) {
            filtered = filtered.filter(item => {
                if (!item.date_received) return false;
                const dateReceived = new Date(item.date_received);
                return dateReceived.getFullYear() === Number(selectedYearly);
            });
        }

        return filtered;
    }, [inventoryItemsData, filterOption, customFrom, customTo, selectedMonth, selectedYear, selectedYearly]);

    return { filteredInventoryItems, loading };
};

export {
    useInventoryItems,
    useInventoryItemsToday,
    useFilteredInventoryItems,
};