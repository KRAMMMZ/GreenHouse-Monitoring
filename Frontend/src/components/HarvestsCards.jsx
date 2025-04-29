import React from "react";

const HarvestCard = ({ title, value, icon, iconSize = "10rem" }) => {
  return (
    <div
      className="d-flex flex-column flex-md-row align-items-center p-3 w-100"
      style={{
        borderRadius: "8px",
        backgroundColor: "#fff",
        overflow: "hidden",
        minHeight: "150px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* Text Section */}
      <div
        className="text-center text-md-left d-flex flex-column justify-content-center flex-grow-1 p-2"
      >
        <h2
          className="fw-bold mb-2 mb-md-0"
          style={{
            color: "#000",
            fontSize: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          {value}
        </h2>
        <p
          className="fw-bold mb-0"
          style={{
            color: "#000",
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Icon Section */}
      <div
        className="d-none d-md-flex justify-content-center align-items-center flex-grow-1 p-2"
      >
        <div style={{ fontSize: iconSize }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default HarvestCard;
