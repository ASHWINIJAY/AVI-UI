import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const response = await api.post("Auth/login", {
        username,
        password,
      });

      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userRole", response.data.userRole);
if (response.data.userRole === "Super User") {
        navigate("/master/dashboard"); // goes to MasterForm
      }
      else if (response.data.userRole === "Assessor") {
        navigate("/dashboard"); // goes to MasterForm
      }
       else {
        navigate("/landing"); // normal flow
      }
      // Redirect to LandingPage
     // navigate("/landing");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%"}}>
      <Row>
        <Col>
          <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
            <Card.Body>
              <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "700"}}>Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
