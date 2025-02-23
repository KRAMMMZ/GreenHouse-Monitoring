import React from "react";

const HarvestCard = ({ title, value, icon, iconSize = "10rem" }) => {
  return (
    <div
      className="d-flex flex-column flex-md-row align-items-center p-3 w-100 "
      style={{
        borderRadius: "8px",
        backgroundColor: "#06402B   ",
        overflow: "hidden",
        minHeight: "150px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Text Section */}
      <div
        className="text-center text-md-left d-flex flex-column justify-content-center "
        style={{
          flex: "1",
          padding: "8px",
          height:"100%",
        }}
      >
        <h2
          className="display-6 fw-bold mb-2 mb-md-0"
          style={{
            color: "#fff",
            fontSize: "clamp(2.5rem, 4vw, 3rem)",
          }}
        >
          {value}
        </h2>
        <p
          className="medium fw-bold mb-0"
          style={{
            color: "#fff",
            fontSize: "clamp(0.675rem, 1.7vw, .9rem)",
          }}
        >
          {title}
        </p>
      </div>

      {/* Icon Section */}
      <div
        className="d-flex justify-content-center align-items-center "
        style={{
          flex: "1",
          height: "100%",
          padding: "8px",
        }}
      >
        <div style={{ fontSize: iconSize }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default HarvestCard;
