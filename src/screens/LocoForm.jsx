import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Loader from "../components/Loader"; // 👈 common loader
const LocoForm = () => {
  const navigate = useNavigate();
  const storedLocoNumber = localStorage.getItem("locoNumber");
const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    LocoNumTxt: storedLocoNumber || "",
    GpsLat: "",
    GpsLong: "",
    LocoPhoto: null,
    ProMainSelect: "",
    FleetRenewSelect: "",
    BodyDamageTxt: "No",
    BodyPhotos: [],
    BodyRepairVal: "",
    LiftingReqTxt: "No",
    LiftingPhotos: [],
    LiftDateTxt: null,
    InventoryNumTxt: "",
    LocoTypeTxt: "",
    NetBookVal: "",
  });

  const [previews, setPreviews] = useState({ loco: null, body: [], lifting: [] });
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // === Load loco details and GPS ===
  useEffect(() => {
    if (storedLocoNumber && navigator.onLine) {
      api
        .get(`InfoLocosFinal/${storedLocoNumber}`)
        .then((res) =>
          setFormData((prev) => ({
            ...prev,
            InventoryNumTxt: res.data.inventoryNumber,
            LocoTypeTxt: res.data.locoType,
            NetBookVal: res.data.netBookValue,
          }))
        )
        .catch((err) => console.error("Auto-populate error:", err));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          GpsLat: position.coords.latitude.toString(),
          GpsLong: position.coords.longitude.toString(),
        }));
      });
    }

    // ✅ Try to sync any pending offline data
   // window.addEventListener("online", syncOfflineData);

   // return () => window.removeEventListener("online", syncOfflineData);
  }, [storedLocoNumber]);

  // === Input change handlers ===
 const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      [type]: type === "LocoPhoto" ? files[0] : files,
    }));
    setPreviews((prev) => ({
      ...prev,
      [type === "LocoPhoto" ? "loco" : type === "BodyPhotos" ? "body" : "lifting"]:
        type === "LocoPhoto" ? newPreviews[0] : newPreviews,
    }));
  };

  // === Offline submission fallback ===
  const handleSubmit = async () => {
    setSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((file) => data.append(key, file));
        } else if (key === "LiftDateTxt" && value instanceof Date) {
          data.append(key, value.toISOString());
        } else {
          data.append(key, value);
        }
      }
    });

    try {
      setLoading(true);
      if (navigator.onLine) {
        // ✅ Online — send to API
        await api.post("InfoLocosFinal/submit", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        navigate("/inspection");
      } 
    } catch (err) {
      console.error("Submit error:", err);
       const isOffline =
    !navigator.onLine ||
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK";

  if (isOffline) {
    const offlineData = JSON.parse(localStorage.getItem("offlineForms") || "[]");
        offlineData.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem("offlineForms", JSON.stringify(offlineData));
        alert("No internet connection. Data saved locally and will sync automatically.");
        navigate("/inspection");
  }
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
      setLoading(false);
    }
  };

  // === Sync offline data when back online ===
  

  const handleCancel = () => navigate("/landing");

  // === UI ===
  return (
    <>
          {loading && <Loader fullscreen />}
     <Container className="mt-5 d-flex justify-content-center">
      <Form
        className="p-4 border rounded shadow-sm"
        style={{ maxWidth: "600px", width: "100%", backgroundColor: "white", marginBottom: "3rem" }}
      >
        <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>
          Info Capture
        </h3>

        <Form.Group className="mb-3">
          <Form.Label>Loco Number</Form.Label>
          <Form.Control type="text" name="LocoNumTxt" value={formData.LocoNumTxt} readOnly required />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>GPS Latitude</Form.Label>
              <Form.Control type="text" name="GpsLat" value={formData.GpsLat} readOnly required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>GPS Longitude</Form.Label>
              <Form.Control type="text" name="GpsLong" value={formData.GpsLong} readOnly required />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Loco Photo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, "LocoPhoto")}
            required
          />
          {previews.loco && <Image src={previews.loco} thumbnail className="mt-2" />}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Program Maintenance</Form.Label>
          <Form.Select name="ProMainSelect" value={formData.ProMainSelect} onChange={handleChange} required>
            <option value="">Select Program</option>
            <option>Minor</option>
            <option>General</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fleet Renewal Program</Form.Label>
          <Form.Select name="FleetRenewSelect" value={formData.FleetRenewSelect} onChange={handleChange} required>
            <option value="">Select Program</option>
            <option>Brake Conversion</option>
            <option>Modification</option>
            <option>Refurbishment</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Body Damage</Form.Label>
          <Form.Select name="BodyDamageTxt" value={formData.BodyDamageTxt} onChange={handleChange} required>
            <option>No</option>
            <option>Yes</option>
          </Form.Select>
        </Form.Group>

        {formData.BodyDamageTxt === "Yes" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Body Photos (Max 3)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={(e) => handleFileChange(e, "BodyPhotos")}
              />
              <Row className="mt-2">
                {previews.body.map((src, i) => (
                  <Col key={i} md={4}>
                    <Image src={src} thumbnail />
                  </Col>
                ))}
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Body Repair Value</Form.Label>
              <Form.Control type="text" name="BodyRepairVal" autoComplete="off" value={formData.BodyRepairVal} onChange={handleChange} />
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Lifting Required</Form.Label>
          <Form.Select name="LiftingReqTxt" value={formData.LiftingReqTxt} onChange={handleChange} required>
            <option>No</option>
            <option>Yes</option>
          </Form.Select>
        </Form.Group>

        {formData.LiftingReqTxt === "Yes" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Lifting Photos (Max 3)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={(e) => handleFileChange(e, "LiftingPhotos")}
              />
              <Row className="mt-2">
                {previews.lifting.map((src, i) => (
                  <Col key={i} md={4}>
                    <Image src={src} thumbnail />
                  </Col>
                ))}
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lift Date</Form.Label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={formData.LiftDateTxt}
                  onChange={(newValue) => setFormData((prev) => ({ ...prev, LiftDateTxt: newValue }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Inventory Number</Form.Label>
          <Form.Control type="text" name="InventoryNumTxt" value={formData.InventoryNumTxt} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Loco Type</Form.Label>
          <Form.Control type="text" name="LocoTypeTxt" value={formData.LocoTypeTxt} readOnly />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Net Book Value</Form.Label>
          <Form.Control type="text" name="NetBookVal" value={formData.NetBookVal} readOnly />
        </Form.Group>

        <Row className="mt-4">
          <Col>
            <Button variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={submitting}>
              {submitting ? "Submitting..." : "Start Inspection Process"}
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal show={showConfirm} onHide={() => !submitting && setShowConfirm(false)}>
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Confirm Start Inspection</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to start the inspection process?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Yes, Start"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
};

export default LocoForm;
