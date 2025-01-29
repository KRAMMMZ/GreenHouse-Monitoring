import { useState, useEffect } from "react";
import axios from "axios";

const useRejectedItems = () => {
  const [rejectedItems, setRejectedItems] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        setRejectedItems(response.data.totalRejected || 0);
      } catch (error) {
        console.error("Error fetching rejected items:", error);
        setRejectedItems(0);
      }
    };

    fetchData();
  }, []);

  return rejectedItems;
};

export default useRejectedItems;
