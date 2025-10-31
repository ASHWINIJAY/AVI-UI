import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from "react-bootstrap";

const WagonLandingPage = () => {
    const [wagonNumber, setWagonNumber] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!wagonNumber) {
        setError("Wagon Number is required.");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const wagonNumberInt = parseInt(wagonNumber, 10);
        const response = await api.get(
          `/WagonLanding/validateWagon/${wagonNumberInt}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.isValid) {
          localStorage.setItem("wagonNumber", wagonNumberInt.toString());
          localStorage.setItem("wagonGroup", response.data.wagonGroup);
          localStorage.setItem("wagonType", response.data.wagonType);

          setLoading(false);
          navigate("/wagoninfo");
        }
        else {
          setLoading(false);
          setError(response.data.message || "Invalid entry.");
        }
      }
      catch (err) {
        setLoading(false);
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
                    <Form.Group controlId="wagonNumber" className="mb-4">
                      <Form.Label>Wagon Number</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter Wagon Number"
                        autoComplete="off"
                        value={wagonNumber}
                        onChange={(e) => setWagonNumber(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                      {loading ? "Loading..." : "Continue"}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <Spinner animation="border" variant="light" role="status" style={{ width: "4rem", height: "4rem" }}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </Container>
      );
};

export default WagonLandingPage;