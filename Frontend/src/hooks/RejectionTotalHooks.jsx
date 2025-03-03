import { useState, useEffect } from "react";
import axios from "axios";

// Utility filter functions
const filterLast7Days = (rejectedTable) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 6);
  return rejectedTable.filter((item) => {
    const itemDate = new Date(item.rejection_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

const filterLast31Days = (rejectedTable) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 30);
  return rejectedTable.filter((item) => {
    const itemDate = new Date(item.rejection_date);
    return itemDate >= pastDate && itemDate <= today;
  });
};

const filterCurrentDay = (rejectedTable) => {
  const today = new Date();
  return rejectedTable.filter((item) => {
    const itemDate = new Date(item.rejection_date);
    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  });
};

// Overall hooks
const useDiseasedOverall = () => {
  const [overallDiseased, setOverallDiseased] = useState(0);
  const [overallDiseasedLoading, setOverallDiseasedLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const totalDiseased = rejectedTable.reduce((sum, item) => sum + item.diseased, 0);
        setOverallDiseased(totalDiseased);
      } catch (error) {
        console.error("Error fetching diseased items:", error);
        setOverallDiseased(0);
      } finally {
        setOverallDiseasedLoading(false);
      }
    };

    fetchData();
  }, []);

  return { overallDiseased, overallDiseasedLoading };
};

const usePhysicallyDamageOverall = () => {
  const [overallPhysicallyDamage, setOverallPhysicallyDamage] = useState(0);
  const [overallPhysicallyDamageLoading, setOverallPhysicallyDamageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const totalPhysicallyDamage = rejectedTable.reduce(
          (sum, item) => sum + item.physically_damaged,
          0
        );
        setOverallPhysicallyDamage(totalPhysicallyDamage);
      } catch (error) {
        console.error("Error fetching physically damaged items:", error);
        setOverallPhysicallyDamage(0);
      } finally {
        setOverallPhysicallyDamageLoading(false);
      }
    };

    fetchData();
  }, []);

  return { overallPhysicallyDamage, overallPhysicallyDamageLoading };
};

const useTooSmallOverall = () => {
  const [overallTooSmall, setOverallTooSmall] = useState(0);
  const [overallTooSmallLoading, setOverallTooSmallLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const totalTooSmall = rejectedTable.reduce((sum, item) => sum + item.too_small, 0);
        setOverallTooSmall(totalTooSmall);
      } catch (error) {
        console.error("Error fetching too small items:", error);
        setOverallTooSmall(0);
      } finally {
        setOverallTooSmallLoading(false);
      }
    };

    fetchData();
  }, []);

  return { overallTooSmall, overallTooSmallLoading };
};

// Last 7 Days hooks
const useDiseasedLast7Days = () => {
  const [diseasedLast7Days, setDiseasedLast7Days] = useState(0);
  const [diseasedLast7DaysLoading, setDiseasedLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast7Days(rejectedTable);
        const totalDiseased = filtered.reduce((sum, item) => sum + item.diseased, 0);
        setDiseasedLast7Days(totalDiseased);
      } catch (error) {
        console.error("Error fetching diseased items (last 7 days):", error);
        setDiseasedLast7Days(0);
      } finally {
        setDiseasedLast7DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { diseasedLast7Days, diseasedLast7DaysLoading };
};

const usePhysicallyDamageLast7Days = () => {
  const [physicallyDamageLast7Days, setPhysicallyDamageLast7Days] = useState(0);
  const [physicallyDamageLast7DaysLoading, setPhysicallyDamageLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast7Days(rejectedTable);
        const totalPhysicallyDamage = filtered.reduce(
          (sum, item) => sum + item.physically_damaged,
          0
        );
        setPhysicallyDamageLast7Days(totalPhysicallyDamage);
      } catch (error) {
        console.error("Error fetching physically damaged items (last 7 days):", error);
        setPhysicallyDamageLast7Days(0);
      } finally {
        setPhysicallyDamageLast7DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { physicallyDamageLast7Days, physicallyDamageLast7DaysLoading };
};

const useTooSmallLast7Days = () => {
  const [tooSmallLast7Days, setTooSmallLast7Days] = useState(0);
  const [tooSmallLast7DaysLoading, setTooSmallLast7DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast7Days(rejectedTable);
        const totalTooSmall = filtered.reduce((sum, item) => sum + item.too_small, 0);
        setTooSmallLast7Days(totalTooSmall);
      } catch (error) {
        console.error("Error fetching too small items (last 7 days):", error);
        setTooSmallLast7Days(0);
      } finally {
        setTooSmallLast7DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { tooSmallLast7Days, tooSmallLast7DaysLoading };
};

// Last 31 Days hooks
const useDiseasedLast31Days = () => {
  const [diseasedLast31Days, setDiseasedLast31Days] = useState(0);
  const [diseasedLast31DaysLoading, setDiseasedLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast31Days(rejectedTable);
        const totalDiseased = filtered.reduce((sum, item) => sum + item.diseased, 0);
        setDiseasedLast31Days(totalDiseased);
      } catch (error) {
        console.error("Error fetching diseased items (last 31 days):", error);
        setDiseasedLast31Days(0);
      } finally {
        setDiseasedLast31DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { diseasedLast31Days, diseasedLast31DaysLoading };
};

const usePhysicallyDamageLast31Days = () => {
  const [physicallyDamageLast31Days, setPhysicallyDamageLast31Days] = useState(0);
  const [physicallyDamageLast31DaysLoading, setPhysicallyDamageLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast31Days(rejectedTable);
        const totalPhysicallyDamage = filtered.reduce(
          (sum, item) => sum + item.physically_damaged,
          0
        );
        setPhysicallyDamageLast31Days(totalPhysicallyDamage);
      } catch (error) {
        console.error("Error fetching physically damaged items (last 31 days):", error);
        setPhysicallyDamageLast31Days(0);
      } finally {
        setPhysicallyDamageLast31DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { physicallyDamageLast31Days, physicallyDamageLast31DaysLoading };
};

const useTooSmallLast31Days = () => {
  const [tooSmallLast31Days, setTooSmallLast31Days] = useState(0);
  const [tooSmallLast31DaysLoading, setTooSmallLast31DaysLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterLast31Days(rejectedTable);
        const totalTooSmall = filtered.reduce((sum, item) => sum + item.too_small, 0);
        setTooSmallLast31Days(totalTooSmall);
      } catch (error) {
        console.error("Error fetching too small items (last 31 days):", error);
        setTooSmallLast31Days(0);
      } finally {
        setTooSmallLast31DaysLoading(false);
      }
    };

    fetchData();
  }, []);

  return { tooSmallLast31Days, tooSmallLast31DaysLoading };
};

// Current Day hooks
const useDiseasedCurrentDay = () => {
  const [diseasedCurrentDay, setDiseasedCurrentDay] = useState(0);
  const [diseasedCurrentDayLoading, setDiseasedCurrentDayLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterCurrentDay(rejectedTable);
        const totalDiseased = filtered.reduce((sum, item) => sum + item.diseased, 0);
        setDiseasedCurrentDay(totalDiseased);
      } catch (error) {
        console.error("Error fetching diseased items (current day):", error);
        setDiseasedCurrentDay(0);
      } finally {
        setDiseasedCurrentDayLoading(false);
      }
    };

    fetchData();
  }, []);

  return { diseasedCurrentDay, diseasedCurrentDayLoading };
};

const usePhysicallyDamageCurrentDay = () => {
  const [physicallyDamageCurrentDay, setPhysicallyDamageCurrentDay] = useState(0);
  const [physicallyDamageCurrentDayLoading, setPhysicallyDamageCurrentDayLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterCurrentDay(rejectedTable);
        const totalPhysicallyDamage = filtered.reduce(
          (sum, item) => sum + item.physically_damaged,
          0
        );
        setPhysicallyDamageCurrentDay(totalPhysicallyDamage);
      } catch (error) {
        console.error("Error fetching physically damaged items (current day):", error);
        setPhysicallyDamageCurrentDay(0);
      } finally {
        setPhysicallyDamageCurrentDayLoading(false);
      }
    };

    fetchData();
  }, []);

  return { physicallyDamageCurrentDay, physicallyDamageCurrentDayLoading };
};

const useTooSmallCurrentDay = () => {
  const [tooSmallCurrentDay, setTooSmallCurrentDay] = useState(0);
  const [tooSmallCurrentDayLoading, setTooSmallCurrentDayLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/reason_for_rejection");
        const rejectedTable = response.data.rejectedTable || [];
        const filtered = filterCurrentDay(rejectedTable);
        const totalTooSmall = filtered.reduce((sum, item) => sum + item.too_small, 0);
        setTooSmallCurrentDay(totalTooSmall);
      } catch (error) {
        console.error("Error fetching too small items (current day):", error);
        setTooSmallCurrentDay(0);
      } finally {
        setTooSmallCurrentDayLoading(false);
      }
    };

    fetchData();
  }, []);

  return { tooSmallCurrentDay, tooSmallCurrentDayLoading };
};

export {
  useDiseasedOverall,
  usePhysicallyDamageOverall,
  useTooSmallOverall,
  useDiseasedLast7Days,
  usePhysicallyDamageLast7Days,
  useTooSmallLast7Days,
  useDiseasedLast31Days,
  usePhysicallyDamageLast31Days,
  useTooSmallLast31Days,
  useDiseasedCurrentDay,
  usePhysicallyDamageCurrentDay,
  useTooSmallCurrentDay,
};
