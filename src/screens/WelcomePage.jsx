import React from "react";
import { Container, Card } from "react-bootstrap";

const WelcomePage = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 16) return "Good Afternoon";
    return "Good Evening";
  };

  const name = localStorage.getItem("name");

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card
        className="p-5 text-center shadow-lg"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <h2 className="mb-3">👋 Welcome!</h2>
        <h4 style={{ fontWeight: "bold", color: "#333" }}>
          {getGreeting()},{" "}
          <span style={{ color: "#288397" }}>{name}</span>
        </h4>
      </Card>
    </Container>
  );
};

export default WelcomePage;
