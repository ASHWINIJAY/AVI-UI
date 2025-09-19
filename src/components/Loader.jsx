// src/components/Loader.jsx
import React from "react";
import "./Loader.css"; // 👈 custom styles

const Loader = ({ fullscreen = false }) => {
  const loaderElement = (
    <div className="modern-spinner">
      <div></div>
      <div></div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loader-overlay">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
};

export default Loader;
