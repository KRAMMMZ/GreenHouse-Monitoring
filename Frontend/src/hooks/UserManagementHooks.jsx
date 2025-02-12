import axios from "axios";
import { useState, useEffect } from "react";

const UserManagement = () => {
    const [ usersManage, setUsersManage] = useState([]);
    const [ usersLoading, setUsersLoading] = useState(true); // Use a meaningful name
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get("http://localhost:3001/users");
          setUsersManage(response.data.userTable || []);  
         
        } catch (error) {
          console.error("Error fetching harvest items:", error);
          setUsersManage([]);
        } finally {
            setUsersLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    return { usersManage, usersLoading };
  };

export default UserManagement;