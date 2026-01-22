import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Modal
} from "react-bootstrap";

const WagonLandingPage = () => {
  const [wagonNumber, setWagonNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
   const [showErrorModal, setShowErrorModal] = useState(false); //(← add)
    const [modalMessage, setModalMessage] = useState(""); //(← add)
  // 🧹 Cleanup
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [incompleteWagons, setIncompleteWagons] = useState([]);
  const [cleanupMessage, setCleanupMessage] = useState("");

  // 🚦 Cockpit pending inspection
  const [isCockpitEnabled, setIsCockpitEnabled] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingAssets, setPendingAssets] = useState([]);
  const [pendingMessage, setPendingMessage] = useState("");

  const navigate = useNavigate();

  // =========================================================
  // 1️⃣ LOAD GLOBAL COCKPIT STATUS
  // =========================================================
  useEffect(() => {
    const loadCockpitStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          "cockpit-allocation/enable-cockpit",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsCockpitEnabled(res.data.isEnabled);
      } catch (err) {
        console.error("Failed to load cockpit status", err);
        setIsCockpitEnabled(false); // fail-safe
      }
    };

    loadCockpitStatus();
  }, []);

  // =========================================================
  // 2️⃣ FETCH INCOMPLETE WAGONS (CLEANUP)
  // =========================================================
  useEffect(() => {
    const fetchIncompleteWagons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          "WagonInfo/CleanLocoInfoCaptures",
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

  // =========================================================
  // 3️⃣ FETCH PENDING INSPECTION ASSETS (ONLY IF COCKPIT ENABLED)
  // =========================================================
  useEffect(() => {
    if (!isCockpitEnabled) return;

    const fetchPendingAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          "cockpit-allocation/pending-assets-wagon",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 🔹 Filter only Wagon assets
        const wagonAssets =
          res?.data?.assets?.filter(a => a.assetType === "Wagon") || [];

        if (wagonAssets.length > 0) {
          setPendingAssets(wagonAssets);
          setPendingMessage(
            res.data.message || "Pending wagon inspections"
          );
          setShowPendingModal(true);
        }
      } catch (err) {
        console.error("Error fetching pending wagon assets:", err);
      }
    };

    fetchPendingAssets();
  }, [isCockpitEnabled]);

  // =========================================================
  // 4️⃣ DELETE INCOMPLETE WAGON → AUTO CONTINUE
  // =========================================================
  const handleDeleteSingle = async (wagonNum) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      await api.post(
        "WagonInfo/DeleteSelectedWagons",
        { wagonNumbers: [wagonNum] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWagonNumber(wagonNum.toString());
      setShowCleanupModal(false);

      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} }, wagonNum);
      }, 400);
    } catch (err) {
      alert("Failed to delete selected wagon.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 5️⃣ CONTINUE INSPECTION FROM COCKPIT POPUP
  // =========================================================
  const handleContinueInspection = (asset) => {
    localStorage.setItem("wagonNumber", asset.assetNumber.toString());
    setShowPendingModal(false);
    navigate("/wagoninfo");
  };

  // =========================================================
  // 6️⃣ SUBMIT / VALIDATE WAGON
  // =========================================================
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
      const validateResp = await api.get(
        `/WagonLanding/validateWagon/${wagonNumberInt}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
 if (!validateResp.data.isValid) {
                setLoading(false);
                showError(validateResp.data.message || "Invalid entry.");
                return;
            }
      
        localStorage.setItem("wagonNumber", wagonNumberInt.toString());
        localStorage.setItem("wagonGroup", validateResp.data.wagonGroup);
        localStorage.setItem("wagonType", validateResp.data.wagonType);
        navigate("/wagoninfo");
     
    } catch (err) {
       setLoading(false);
            console.error(err);
            showError("Unable to validate Wagon/Asset number. Please try again.");
            return;
    } finally {
      setLoading(false);
    }
  };
 const showError = (message) => {
        setModalMessage(message);
        setShowErrorModal(true);
    };
  // =========================================================
  // RENDER
  // =========================================================
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
            zIndex: 9999
          }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      )}

      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "#025373", height: "82.5vh" }}
      >
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ minWidth: 350 }}>
              <Card.Body>
                <h2 className="text-center mb-4">
                  Wagon Info Capture
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Wagon Number</Form.Label>
                    <Form.Control
                      type="number"
                      value={wagonNumber}
                      onChange={(e) => setWagonNumber(e.target.value)}
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100">
                    Continue
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 🚦 Pending Wagon Inspections Modal */}
      {isCockpitEnabled && (
        <Modal
          show={showPendingModal}
          onHide={() => setShowPendingModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Pending Wagon Inspections</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{pendingMessage}</p>
            <div className="d-grid gap-2">
              {pendingAssets.map((asset, idx) => (
                <Button
                  key={idx}
                  variant="outline-warning"
                  size="lg"
                  onClick={() => handleContinueInspection(asset)}
                >
                  🚃 Wagon {asset.assetNumber}
                </Button>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* 🧹 Cleanup Modal */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Incomplete Wagon Records</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{cleanupMessage}</p>
          <div className="d-grid gap-2">
            {incompleteWagons.map((num, idx) => (
              <Button
                key={idx}
                variant="outline-primary"
                size="lg"
                onClick={() => handleDeleteSingle(num)}
              >
                🚃 Wagon {num}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
       <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Validation Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalMessage}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowErrorModal(false)}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
    </>
  );
};

export default WagonLandingPage;
