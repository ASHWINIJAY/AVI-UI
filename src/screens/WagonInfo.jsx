import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

const WagonInfo = () => {
  const navigate = useNavigate();
  const storedWagonNumber = localStorage.getItem("wagonNumber");
  const storedWagonGroup = localStorage.getItem("wagonGroup");
  const storedWagonType = localStorage.getItem("wagonType");

  const [formData, setFormData] = useState({
    WagonNumTxt: storedWagonNumber || "",
    InventoryNumTxt: "",
    NetBookVal: "",
    GpsLat: "",
    GpsLong: "",
    WagonPhoto: null,
    WagonPhotoPreview: null,
    BodyDamageTxt: "No",
    BodyPhoto1: null,
    BodyPhoto1Preview: null,
    BodyPhoto2: null,
    BodyPhoto2Preview: null,
    BodyPhoto3: null,
    BodyPhoto3Preview: null,
    WagonGroupTxt: storedWagonGroup || "",
    BrakeTypeTxt: "",
    WagonTypeTxt: storedWagonType || "",
    LiftingPhoto: null,
    LiftingPhotoPreview: null,
    LiftDateTxt: null,
    BarrelPhoto: null,
    BarrelPhotoPreview: null,
    BarrelDateTxt: null,
    BrakePhoto: null,
    BrakePhotoPreview: null,
    BrakeDateTxt: null
  });

  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Response metadata from backend (used for navigation)
  const [responseMeta, setResponseMeta] = useState(null); //(Luca) Change

  useEffect(() => {
    if (storedWagonNumber) {
      const wagonNumberInt = parseInt(storedWagonNumber, 10);
      axios
        .get(`WagonInfo/${wagonNumberInt}`)
        .then((res) =>
          setFormData((prev) => ({
            ...prev,
            InventoryNumTxt: res.data.inventoryNumber || "",
            NetBookVal: res.data.netBookValue || "",
          }))
        )
        .catch((err) => console.error("Auto-populate error:", err));
    }

    if (storedWagonGroup) {
      axios
        .get(`WagonInfo/getBrakeType/${encodeURIComponent(storedWagonGroup)}`)
        .then((res) =>
          setFormData((prev) => ({
            ...prev,
            BrakeTypeTxt: res.data.brakeType || "",
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
  }, [storedWagonNumber, storedWagonGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const previewName = `${name}Preview`;
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        [previewName]: URL.createObjectURL(file),
      }));
    }
  };

  const handleBack = () => {
    localStorage.removeItem("wagonNumber");
    localStorage.removeItem("wagonGroup");
    localStorage.removeItem("wagonType");
    navigate("/choose");
  };

  // Client-side validation before submit
  const validateBeforeSubmit = () => {
    const errors = [];

    // Wagon photo required
    if (!formData.WagonPhoto) {
        errors.push("Wagon Photo is required.");
      }

      if (!formData.LiftingPhoto) {
          errors.push("Lift Photo is required.");
      }
       
      if (!formData.LiftDateTxt) {
          errors.push("Lift Date is required.");
      }

      if (!formData.BrakePhoto) {
          errors.push("Brake Photo is required.");
      }

      if (!formData.BrakeDateTxt) {
          errors.push("Brake Date is required.");
      }

    // Body photos required if BodyDamage = Yes
    if (formData.BodyDamageTxt === "Yes") {
      if (!formData.BodyPhoto1) errors.push("Body Photo 1 is required.");
      if (!formData.BodyPhoto2) errors.push("Body Photo 2 is required.");
      if (!formData.BodyPhoto3) errors.push("Body Photo 3 is required.");
    }

    // Tanker-specific checks
    if (formData.WagonTypeTxt === "Tanker") {
      if (!formData.BarrelPhoto) errors.push("Barrel Photo is required for Tanker wagons.");
      if (!formData.BarrelDateTxt) errors.push("Barrel Date is required for Tanker wagons.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    const errors = validateBeforeSubmit();
    if (errors.length > 0) {
      setErrorMessages(errors);
      setShowError(true);
      return;
    }

    setLoading(true);
    const data = new FormData();

    const liftDate =
    formData.LiftDateTxt instanceof Date
      ? format(formData.LiftDateTxt, "yyyy-MM-dd")
      : "";
    const barrelDate =
    formData.BarrelDateTxt instanceof Date
      ? format(formData.BarrelDateTxt, "yyyy-MM-dd")
      : "";
    const brakeDate =
    formData.BrakeDateTxt instanceof Date
      ? format(formData.BrakeDateTxt, "yyyy-MM-dd")
      : "";

    data.append("WagonNumber", formData.WagonNumTxt);
    data.append("InventoryNumber", formData.InventoryNumTxt);
    data.append("NetBookValue", formData.NetBookVal);
    data.append("GpsLatitude", formData.GpsLat);
    data.append("GpsLongitude", formData.GpsLong);

    // files - append only real File objects. If missing, backend handles "No Photo" or "N/A"
    if (formData.WagonPhoto) data.append("WagonPhoto", formData.WagonPhoto);
    if (formData.BodyPhoto1) data.append("BodyPhoto1", formData.BodyPhoto1);
    if (formData.BodyPhoto2) data.append("BodyPhoto2", formData.BodyPhoto2);
    if (formData.BodyPhoto3) data.append("BodyPhoto3", formData.BodyPhoto3);

    data.append("BodyDamage", formData.BodyDamageTxt);
    data.append("WagonGroup", formData.WagonGroupTxt);
    data.append("BrakeType", formData.BrakeTypeTxt);
      data.append("WagonType", formData.WagonTypeTxt);

      if (formData.LiftingPhoto) {
          data.append("LiftPhoto", formData.LiftingPhoto);
      }
      data.append("LiftDate", liftDate);

      if (formData.BrakePhoto) {
          data.append("BrakePhoto", formData.BrakePhoto);
      }
      data.append("BrakeDate", brakeDate);

    if (formData.WagonTypeTxt === "Tanker") {
      if (formData.BarrelPhoto) data.append("BarrelPhoto", formData.BarrelPhoto);
      data.append("BarrelDate", barrelDate);
    }

    try {
      const res = await axios.post("WagonInfo/submit", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const meta = res.data || {};
        setResponseMeta(meta);

        handleNavigation(meta); //(Luca) Add

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMessages(["Error submitting wagon info. See console for details."]);
      setShowError(true);
    } finally {
      setLoading(false);
    }
    };

    //(Luca) Add
    const handleNavigation = (meta) => {
        const lift = meta.LiftLapsed ?? meta.liftLapsed ?? "N/A";
        const brake = meta.BrakeLapsed ?? meta.brakeLapsed ?? "N/A";
        const brakeType = meta.BrakeType ?? meta.brakeType ?? formData.BrakeTypeTxt ?? "";
        const doors = meta.wagonDoors || "N/A";
        const stanchions = meta.wagonStan || "N/A";
        const twistlocks = meta.wagonTwist || "N/A";

        const wagonType = formData.WagonTypeTxt;

        if (lift === "No" && brake === "No") return navigate("/wagonparts");

        if (lift === "Yes" && brake === "No") {
            if (brakeType === "Air Brake" || brakeType === "Dual Brake") return navigate("/airbrakeparts");
            if (brakeType === "Vacuum Brake") return navigate("/vacbrakeparts");
        }

        if (lift === "Yes" && brake === "Yes") {
            if (wagonType === "Tanker") return navigate("/wagontanker");
            if (wagonType === "Bottom Discharge") return navigate("/wagonbottom");

            if ((doors === "N/A" || doors === "") && (twistlocks === "N/A" || twistlocks === "") && (stanchions === "N/A" || stanchions === ""))
                return navigate("/wagonfloor");

            if (doors === "Yes") return navigate("/wagondoors");
            if (twistlocks === "Yes") return navigate("/wagontwist");
            if (stanchions === "Yes") return navigate("/wagonstan");
        }
    };

    //(Luca) Change
  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Form className="p-4 border rounded shadow-sm" style={{ maxWidth: "600px", width: "100%", backgroundColor: "white", marginBottom: "3rem" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>Info Capture</h3>

        <Form.Group className="mb-3">
          <Form.Label>Wagon Number</Form.Label>
          <Form.Control type="text" name="WagonNumTxt" value={formData.WagonNumTxt} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Inventory Number</Form.Label>
          <Form.Control type="text" name="InventoryNumTxt" value={formData.InventoryNumTxt} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Net Book Value</Form.Label>
          <Form.Control type="text" name="NetBookVal" value={formData.NetBookVal} readOnly />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>GPS Latitude</Form.Label>
              <Form.Control type="text" name="GpsLat" value={formData.GpsLat} readOnly />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>GPS Longitude</Form.Label>
              <Form.Control type="text" name="GpsLong" value={formData.GpsLong} readOnly />
            </Form.Group>
          </Col>
        </Row>

        {/* Wagon Photo */}
        <Form.Group className="mb-3">
          <Form.Label>Wagon Photo</Form.Label>
          <Form.Control type="file" name="WagonPhoto" accept="image/*" capture="environment" onChange={handleFileChange} />
          {formData.WagonPhotoPreview && <img src={formData.WagonPhotoPreview} alt="Wagon Preview" style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />}
        </Form.Group>

        {/* Body Damage */}
        <Form.Group className="mb-3">
          <Form.Label>Body Damage</Form.Label>
          <Form.Select name="BodyDamageTxt" value={formData.BodyDamageTxt} onChange={handleChange}>
            <option>No</option>
            <option>Yes</option>
          </Form.Select>
        </Form.Group>

        {formData.BodyDamageTxt === "Yes" && (
          <>
            {[1, 2, 3].map((num) => (
              <Form.Group key={num} className="mb-3">
                <Form.Label>{`Body Photo ${num}`}</Form.Label>
                <Form.Control type="file" name={`BodyPhoto${num}`} accept="image/*" capture="environment" onChange={handleFileChange} />
                {formData[`BodyPhoto${num}Preview`] && (
                  <img src={formData[`BodyPhoto${num}Preview`]} alt={`Body Photo ${num}`} style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />
                )}
              </Form.Group>
            ))}
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Wagon Group</Form.Label>
          <Form.Control type="text" name="WagonGroupTxt" value={formData.WagonGroupTxt} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Brake Type</Form.Label>
          <Form.Select name="BrakeTypeTxt" value={formData.BrakeTypeTxt} onChange={handleChange}>
            <option>Air Brake</option>
            <option>Vacuum Brake</option>
            <option>Dual Brake</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Wagon Type</Form.Label>
          <Form.Control type="text" name="WagonTypeTxt" value={formData.WagonTypeTxt} readOnly />
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Lift Photo</Form.Label>
                  <Form.Control type="file" name="LiftingPhoto" accept="image/*" capture="environment" onChange={handleFileChange} />
                  {formData.LiftingPhotoPreview && <img src={formData.LiftingPhotoPreview} alt="Lift Photo" style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />}
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Lift Date</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker value={formData.LiftDateTxt} onChange={(newValue) => setFormData(prev => ({ ...prev, LiftDateTxt: newValue }))} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Brake Photo</Form.Label>
                  <Form.Control type="file" name="BrakePhoto" accept="image/*" capture="environment" onChange={handleFileChange} />
                  {formData.BrakePhotoPreview && <img src={formData.BrakePhotoPreview} alt="Brake Photo" style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />}
              </Form.Group>

              <Form.Group className="mb-3">
                  <Form.Label>Brake Test Date</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker value={formData.BrakeDateTxt} onChange={(newValue) => setFormData(prev => ({ ...prev, BrakeDateTxt: newValue }))} slotProps={{ textField: { fullWidth: true } }} />
                  </LocalizationProvider>
              </Form.Group>

        {formData.WagonTypeTxt === "Tanker" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Barrel Photo</Form.Label>
              <Form.Control type="file" name="BarrelPhoto" accept="image/*" capture="environment" onChange={handleFileChange} />
              {formData.BarrelPhotoPreview && <img src={formData.BarrelPhotoPreview} alt="Barrel Photo" style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Barrel Test Date</Form.Label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker value={formData.BarrelDateTxt} onChange={(newValue) => setFormData(prev => ({ ...prev, BarrelDateTxt: newValue }))} slotProps={{ textField: { fullWidth: true } }} />
              </LocalizationProvider>
            </Form.Group>
          </>
        )}

        {/* Buttons */}
        <Row className="mt-4">
          <Col>
            <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading.." : "Start Inspection"}</Button>
          </Col>
        </Row>

        {/* Confirm Modals */}
        <Modal show={showConfirmBack} onHide={() => !loading && setShowConfirmBack(false)}>
          <Modal.Header closeButton={!loading}>
            <Modal.Title>Confirm Back</Modal.Title>
          </Modal.Header>
          <Modal.Body>Warning: Progress will be lost. Do you want to go back?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmBack(false)} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleBack} disabled={loading}>Confirm</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showConfirm} onHide={() => !loading && setShowConfirm(false)}>
          <Modal.Header closeButton={!loading}>
            <Modal.Title>Confirm Start Inspection</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you want to start the inspection process?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>{loading ? "Loading..." : "Yes, Start"}</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showError} onHide={() => setShowError(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Submission Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {errorMessages.map((m, i) => (<li key={i}>{m}</li>))}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowError(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showSuccess} onHide={handleSuccessClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Info Capture Successful</Modal.Title>
          </Modal.Header>
          <Modal.Body>Wagon info capture has been submitted successfully.</Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={handleSuccessClose}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {loading && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
            <Spinner animation="border" variant="light" style={{ width: "4rem", height: "4rem" }} />
          </div>
        )}
      </Form>
    </Container>
  );
};

export default WagonInfo;
