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
  Modal
} from "react-bootstrap";
import Loader from "../components/Loader";
import { getCachedDataWhenOffline } from "../utils/offlineHelper";

const LandingPage = () => {
  const [locoNumber, setLocoNumber] = useState("");
  const [error, setError] = useState("");
  const [locoList, setLocoList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧹 Incomplete cleanup
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [incompleteLocos, setIncompleteLocos] = useState([]);
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
  // 2️⃣ FETCH INCOMPLETE LOCOS (CLEANUP)
  // =========================================================
  useEffect(() => {
    const fetchIncompleteLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          "LocoInfoCapture/CleanLocoInfoCaptures",
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

  // =========================================================
  // 3️⃣ FETCH PENDING INSPECTION ASSETS (ONLY IF COCKPIT ENABLED)
  // =========================================================
  useEffect(() => {
    if (!isCockpitEnabled) return;

    const fetchPendingAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(
          "cockpit-allocation/pending-assets",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res?.data?.assets?.length > 0) {
          setPendingAssets(res.data.assets);
          setPendingMessage(
            res.data.message || "Pending assets for inspection"
          );
          setShowPendingModal(true);
        }
      } catch (err) {
        console.error("Error fetching pending assets:", err);
      }
    };

    fetchPendingAssets();
  }, [isCockpitEnabled]);

  // =========================================================
  // 4️⃣ DELETE INCOMPLETE LOCO → AUTO CONTINUE
  // =========================================================
  const handleDeleteSingle = async (locoNum) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      await api.post(
        "LocoInfoCapture/DeleteSelectedLocos",
        { locoNumbers: [locoNum] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLocoNumber(locoNum.toString());
      setShowCleanupModal(false);

      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} }, locoNum);
      }, 400);
    } catch (err) {
      alert("Failed to delete selected loco.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 5️⃣ CONTINUE INSPECTION FROM COCKPIT POPUP
  // =========================================================
  const handleContinueInspection = (asset) => {
    localStorage.setItem("locoNumber", asset.assetNumber.toString());
    setShowPendingModal(false);
    navigate("/locoinfo");
  };

  // =========================================================
  // 6️⃣ SUBMIT / VALIDATE LOCO
  // =========================================================
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
      const response = await api.get(
        `Landing/validateLoco/${locoNumberInt}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.isValid) {
        localStorage.setItem("locoNumber", locoNumberInt.toString());
        localStorage.setItem("locoClass", response.data.locoClass);
        localStorage.setItem("locoModel", response.data.locoModel);
        navigate("/locoinfo");
      } else if (response.data.message) {
        alert(response.data.message);
      }
    } catch (err) {
      const cachedData = getCachedDataWhenOffline(
        "locoMasterList",
        locoNumberInt
      );
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

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {loading && <Loader fullscreen />}

      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "#025373", height: "82.5vh" }}
      >
        <Row>
          <Col>
            <Card className="p-4 shadow-sm" style={{ minWidth: 350 }}>
              <Card.Body>
                <h2 className="text-center mb-4">Info Capture</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Loco Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={locoNumber}
                      onChange={(e) => setLocoNumber(e.target.value)}
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

      {/* 🚦 Pending Cockpit Assets Modal */}
      {isCockpitEnabled && (
        <Modal show={showPendingModal} onHide={() => setShowPendingModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Pending Inspections</Modal.Title>
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
                  🚂 {asset.assetType} {asset.assetNumber}
                </Button>
              ))}
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* 🧹 Cleanup Modal */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Incomplete Loco Records</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{cleanupMessage}</p>
          <div className="d-grid gap-2">
            {incompleteLocos.map((num, idx) => (
              <Button
                key={idx}
                variant="outline-primary"
                size="lg"
                onClick={() => handleDeleteSingle(num)}
              >
                🚂 Loco {num}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LandingPage;
