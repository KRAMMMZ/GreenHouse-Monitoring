  import React from "react";
  import image from "../assets/N_AGREEMO.png"; // Correct relative path

  const LoadingScreen = ({ progress }) => {
    const text = "Greenhouse Monitoring";
    // Calculate how many characters to show based on progress
    const displayedText = text.slice(0, Math.floor((progress / 100) * text.length));

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#f9f9f9",
        }}
      >
        <img
          src={image}
          alt="Logo"
          style={{
            width: "min(15em, 80vw)",
            height: "auto",
          }}
        />
        <div
          style={{
            width: "min(15em, 80vw)",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          {/* Display the typewriter effect text above the progress bar */}
          <p
            style={{
              marginBottom: "10px",
              fontSize: "1.2em",
              fontWeight: "bold",
              color: "#06402B",
            }}
          >
            {displayedText}
          </p>
          {/* Custom styles for the progress bar */}
          <style>
            {`
              progress {
                appearance: none;
                -webkit-appearance: none;
                width: 100%;
                height: 10px;
              }
              progress::-webkit-progress-bar {
                background-color: #ddd;
                border-radius: 10px;
              }
              progress::-webkit-progress-value {
                background-color: #06402B;
                border-radius: 10px;
              }
              progress::-moz-progress-bar {
                background-color: #06402B;
                border-radius: 10px;
              }
            `}
          </style>
          <progress value={progress} max="100">
            {progress}%
          </progress>
        </div>
      </div>
    );
  };

  export default LoadingScreen;
