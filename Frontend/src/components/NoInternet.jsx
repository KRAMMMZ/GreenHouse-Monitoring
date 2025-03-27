import React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";

const NoInternetComponent = () => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
  };

  const iconStyle = {
    fontSize: "20em",
  };

  return (
    <div style={containerStyle}>
      <WifiOffIcon style={iconStyle} />
      <p>No Internet</p>
    </div>
  );
};

export default NoInternetComponent;
