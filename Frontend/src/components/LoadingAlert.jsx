// LoadingAlert.jsx
import Swal from "sweetalert2";
import { useEffect } from "react";

const LoadingAlert = ({ message }) => {
  useEffect(() => {
    Swal.fire({
      title: message || "Please wait...",
      html: "Processing...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Cleanup on component unmount
    return () => {
      Swal.close();
    };
  }, [message]);

  return null; // This component does not render anything visually
};

export default LoadingAlert;
