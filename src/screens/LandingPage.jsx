import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const LandingPage = () => {
  const [locoNumber, setLocoNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!locoNumber) {
      setError("Loco Number is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://41.87.206.94/AVIapi/api/Landing/validateLoco",
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
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%"}}>
      <Row>
        <Col>
          <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
            <Card.Body>
              <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
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
