import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const LandingPage = () => {
  const [locoNumber, setLocoNumber] = useState("");
  const [error, setError] = useState("");
  const [locoList, setLocoList] = useState([]);
  const navigate = useNavigate();

  // 🔹 Fetch loco list from API on mount
  useEffect(() => {
    const fetchLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("Landing/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setLocoList(response.data);
          // Store in localStorage for offline use
          localStorage.setItem("locoList", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch from API, fallback to localStorage:", err);
        const cached = localStorage.getItem("locoList");
        if (cached) {
          setLocoList(JSON.parse(cached));
        }
      }
    };

    fetchLocos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!locoNumber) {
      setError("Loco Number is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 🔹 Try validating with API
      const response = await api.post(
        "Landing/validateLoco",
        { locoNumber },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.isValid) {
        localStorage.setItem("locoNumber", locoNumber);
        navigate("/locoform");
      } else {
        setError("Invalid Loco Number. Please enter a valid one.");
      }
    } catch (err) {
      console.warn("API failed, fallback to offline validation:", err);

      // 🔹 Offline validation from stored list
      const cached = localStorage.getItem("locoList");
      if (cached) {
        const offlineList = JSON.parse(cached);
        const exists = offlineList.some(
    (l) => String(l.locoNumber) === String(locoNumber) // ✅ normalize types
  );


        if (exists) {
          localStorage.setItem("locoNumber", locoNumber);
          navigate("/locoform");
        } else {
          setError("Invalid Loco Number (offline check).");
        }
      } else {
        setError("No cached loco list available. Please connect to internet.");
      }
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}
    >
      <Row>
        <Col>
          <Card
            className="p-4 shadow-sm"
            style={{ minWidth: "350px", maxWidth: "400px" }}
          >
            <Card.Body>
              <h2
                className="text-center mb-4"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Info Capture
              </h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="locoNumber" className="mb-4">
                  <Form.Label>Loco Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Loco Number"
                    value={locoNumber}
                    onChange={(e) => setLocoNumber(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Continue
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
