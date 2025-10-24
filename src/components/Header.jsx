import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show logout if NOT on the login page
  const showLogout = location.pathname !== "/";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("locoNumber");
    localStorage.removeItem("locoClass");
    localStorage.removeItem("locoModel");
    navigate("/");   // Redirect to login page
  };

  return (
    <Navbar bg="white" className="shadow-sm" expand="lg" style={{ position: "relative", height: "70px" }}>
      <Container className="d-flex justify-content-between align-items-center">
        {/* Left side: spacer */}
        <div style={{ width: "50px" }} />

        {/* Centered Brand */}
        <Navbar.Brand
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Faster One', cursive",
            fontSize: "2rem",
            letterSpacing: "1px",
            color: "#0388A6",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          AVI
        </Navbar.Brand>

        {/* Right side: Logout button */}
        <div className="d-flex justify-content-end">
          {showLogout && (
            <Button variant="outline-primary" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
