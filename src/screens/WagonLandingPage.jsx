import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, Modal } from "react-bootstrap";

const WagonLandingPage = () => {
  const [wagonNumber, setWagonNumber] = useState("");
  const [error, setError] = useState("");
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [incompleteWagons, setIncompleteWagons] = useState([]);
  const [cleanupMessage, setCleanupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch incomplete wagons on page load
  useEffect(() => {
    const fetchIncompleteWagons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("WagonInfo/CleanLocoInfoCaptures", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.incompleteWagons?.length > 0) {
          setCleanupMessage(
            res.data.message ||
              "You have the following incomplete wagon(s). Please clean them if needed."
          );
          setIncompleteWagons(res.data.incompleteWagons);
          setShowCleanupModal(true);
        }
      } catch (err) {
        console.error("Error fetching incomplete wagons:", err);
      }
    };

    fetchIncompleteWagons();
  }, []);

  // 🔹 Delete wagon → fill textbox → auto-submit
  const handleDeleteSingle = async (wagonNum) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const res = await api.post(
        "WagonInfo/DeleteSelectedWagons",
        { wagonNumbers: [wagonNum] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

     // alert(res.data.message || `Wagon ${wagonNum} deleted successfully.`);

      // ✅ Set wagon number to input
      setWagonNumber(wagonNum.toString());

      // ✅ Close modal
      setShowCleanupModal(false);

      // ✅ Trigger validation automatically
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} }, wagonNum);
      }, 400);
    } catch (err) {
      console.error("Error deleting wagon:", err);
      alert("Failed to delete selected wagon.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Submit validation
  const handleSubmit = async (e, overrideWagonNumber) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");

    const currentWagon = overrideWagonNumber || wagonNumber;
    if (!currentWagon) {
      setError("Wagon Number is required.");
      return;
    }

    const wagonNumberInt = parseInt(currentWagon, 10);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/WagonLanding/validateWagon/${wagonNumberInt}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.isValid) {
        localStorage.setItem("wagonNumber", wagonNumberInt.toString());
        localStorage.setItem("wagonGroup", response.data.wagonGroup);
        localStorage.setItem("wagonType", response.data.wagonType);
        navigate("/wagoninfo");
      } else {
        setError(response.data.message || "Invalid wagon number.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}
      >
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
              <Card.Body>
                <h2
                  className="text-center mb-4"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}
                >
                  Wagon Info Capture
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

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Continue"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 🧹 Cleanup Modal */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Incomplete Wagon Records</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3" style={{ fontWeight: 500 }}>
            {cleanupMessage}
          </p>
          {incompleteWagons.length > 0 ? (
            <div className="d-grid gap-2">
              {incompleteWagons.map((num, idx) => (
                <Button
                  key={idx}
                  variant="outline-primary"
                  className="mb-2"
                  size="lg"
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                  }}
                  onClick={() => handleDeleteSingle(num)}
                >
                  🚃 Wagon {num}
                </Button>
              ))}
            </div>
          ) : (
            <p>No incomplete wagons found.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default WagonLandingPage;
