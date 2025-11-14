import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card, Modal } from "react-bootstrap";
import Loader from "../components/Loader";
import { getCachedDataWhenOffline } from "../utils/offlineHelper";

const LandingPage = () => {
  const [locoNumber, setLocoNumber] = useState("");
  const [error, setError] = useState("");
  const [locoList, setLocoList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [incompleteLocos, setIncompleteLocos] = useState([]);
  const [cleanupMessage, setCleanupMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch incomplete loco list (without deletion)
  useEffect(() => {
    const fetchIncompleteLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("LocoInfoCapture/CleanLocoInfoCaptures", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.incompleteLocos?.length > 0) {
          setCleanupMessage(
            res.data.message ||
              "You have the following incomplete loco(s). Please clean them if needed."
          );
          setIncompleteLocos(res.data.incompleteLocos);
          setShowCleanupModal(true);
        }
      } catch (err) {
        console.error("Error fetching incomplete locos:", err);
      }
    };

    fetchIncompleteLocos();
  }, []);

  // 🔹 Delete loco → auto-fill → auto-submit
  const handleDeleteSingle = async (locoNum) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const res = await api.post(
        "LocoInfoCapture/DeleteSelectedLocos",
        { locoNumbers: [locoNum] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    //  alert(res.data.message || `Loco ${locoNum} deleted successfully.`);

      // ✅ Assign deleted loco to textbox
      setLocoNumber(locoNum.toString());

      // ✅ Close popup
      setShowCleanupModal(false);

      // ✅ Auto-submit the form
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} }, locoNum);
      }, 400);
    } catch (err) {
      console.error("Error deleting loco:", err);
      alert("Failed to delete selected loco.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch loco list
  useEffect(() => {
    const fetchLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("Landing/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setLocoList(response.data);
          localStorage.setItem("locoList", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch from API, fallback to localStorage:", err);
        const cached = localStorage.getItem("locoList");
        if (cached) setLocoList(JSON.parse(cached));
      }
    };

    fetchLocos();
  }, []);

  // 🔹 Handle submit / validate
  const handleSubmit = async (e, overrideLocoNumber) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");

    const currentLoco = overrideLocoNumber || locoNumber;
    if (!currentLoco) {
      setError("Loco Number is required.");
      return;
    }

    const locoNumberInt = parseInt(currentLoco, 10);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`Landing/validateLoco/${locoNumberInt}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.isValid) {
        localStorage.setItem("locoNumber", locoNumberInt.toString());
        localStorage.setItem("locoClass", response.data.locoClass);
        localStorage.setItem("locoModel", response.data.locoModel);

        if (response.data.message) {
          alert(response.data.message);
          return;
        }

        if (!response.data.locoModel) {
          alert("Missing Loco Model, Please enter a valid one");
          return;
        }

        navigate("/locoinfo");
      } else {
        if (!response.data.locoModel) {
          alert("Missing Loco Model, Please enter a valid one");
          return;
        }
        if (response.data.message) {
          alert(response.data.message);
          return;
        }
      }
    } catch (err) {
      console.warn("API failed, fallback to offline validation:", err);

      if (err?.response?.status === 404) {
        alert("LocoModel not found, Please try another loco number");
        return;
      }

      const cacheKey = "locoMasterList";
      const cachedData = getCachedDataWhenOffline(cacheKey, locoNumberInt);

      if (cachedData) {
        localStorage.setItem("locoNumber", locoNumberInt.toString());
        localStorage.setItem("locoClass", cachedData.locoClass);
        localStorage.setItem("locoModel", cachedData.locoModel);
        navigate("/locoinfo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader fullscreen />}

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
                      autoComplete="off"
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

      {/* 🧹 Cleanup Modal */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Incomplete Loco Records</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3" style={{ fontWeight: 500 }}>
            {cleanupMessage}
          </p>
          {incompleteLocos.length > 0 ? (
            <div className="d-grid gap-2">
              {incompleteLocos.map((num, idx) => (
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
                  🚂 Loco {num}
                </Button>
              ))}
            </div>
          ) : (
            <p>No incomplete locos found.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LandingPage;
