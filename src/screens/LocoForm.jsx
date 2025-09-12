import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const LocoForm = () => {
  const navigate = useNavigate();
  const storedLocoNumber = localStorage.getItem("locoNumber");

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

  // Auto-populate InventoryNum, LocoType, NetBookVal and GPS
  useEffect(() => {
    if (storedLocoNumber) {
      axios
        .get(`http://41.87.206.94/AVIapi/api/InfoLocosFinal/${storedLocoNumber}`)
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
  }, [storedLocoNumber]);

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
      await axios.post("http://41.87.206.94/AVIapi/api/InfoLocosFinal/submit", data);
      navigate("/walkaroundinspect");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting form");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => navigate("/landing");

  return (
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
              <Form.Control type="text" name="BodyRepairVal" value={formData.BodyRepairVal} onChange={handleChange} />
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
  );
};

export default LocoForm;
