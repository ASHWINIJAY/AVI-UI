import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { getCachedDataWhenOffline } from "../utils/offlineHelper";

const LocoInfoCapture = () => {
  const navigate = useNavigate();
  const storedLocoNumber = localStorage.getItem("locoNumber");
  const storedLocoClass = localStorage.getItem("locoClass");
  const storedLocoModel = localStorage.getItem("locoModel");

  const [formData, setFormData] = useState({
    LocoNumTxt: storedLocoNumber || "",
    InventoryNumTxt: "",
    NetBookVal: "",
    GpsLat: "",
    GpsLong: "",
    LocoPhoto: null,
    LocoPhotoPreview: null,
    BodyDamageTxt: "No",
    BodyPhoto1: null,
    BodyPhoto1Preview: null,
    BodyPhoto2: null,
    BodyPhoto2Preview: null,
    BodyPhoto3: null,
    BodyPhoto3Preview: null,
    LocoClassTxt: storedLocoClass || "",
    LocoModelTxt: storedLocoModel || "",
    LiftingPhoto: null,
    LiftingPhotoPreview: null,
    LiftDateTxt: null,
  });

  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
const [locoList, setLocoList] = useState([]);
const [locoMasterList, setLocoMasterList] = useState([]);
  // Response metadata from backend (used for navigation)
  const [responseMeta, setResponseMeta] = useState(null);

  useEffect(() => {
    if (storedLocoNumber) {
      try
      {
      const locoNumberInt = parseInt(storedLocoNumber, 10);
      axios
        .get(`/LocoInfoCapture/${locoNumberInt}`)
        .then((res) =>
          setFormData((prev) => ({
            ...prev,
            InventoryNumTxt: res.data.inventoryNumber || "",
            NetBookVal: res.data.netBookValue || "N/A",
          }))
        )
        .catch((err) => console.error("Auto-populate error:", err));
      }
      catch{
        const isOffline =
            !navigator.onLine ||
            err.message === "Network Error" ||
            err.code === "ERR_NETWORK";
        
          if (isOffline) {
            const locoNumberInt = parseInt(storedLocoNumber, 10);
  const cacheKey = "locoMasterList";
             const cachedData = getCachedDataWhenOffline(cacheKey, locoNumberInt);
            if (cachedData) {
              setFormData((prev) => ({
                ...prev,
                InventoryNumTxt: cachedData.inventoryNumber || "",
                NetBookVal: cachedData.netBookValue || "N/A",
              }));
              
              //return; // ✅ Stop here — don’t call API
            }
          }
      }
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
    localStorage.removeItem("locoNumber");
    localStorage.removeItem("locoClass");
    localStorage.removeItem("locoModel");
    navigate("/landing");
  };

  // Client-side validation before submit
  const validateBeforeSubmit = () => {
    const errors = [];

    // Wagon photo required
    if (!formData.LocoPhoto) {
      errors.push("Loco Photo is required.");
    }

    // Body photos required if BodyDamage = Yes
    if (formData.BodyDamageTxt === "Yes") {
      if (!formData.BodyPhoto1) errors.push("Body Photo 1 is required when Body Damage = Yes.");
      if (!formData.BodyPhoto2) errors.push("Body Photo 2 is required when Body Damage = Yes.");
      if (!formData.BodyPhoto3) errors.push("Body Photo 3 is required when Body Damage = Yes.");
    }

    if(!formData.LiftingPhoto) {
        errors.push("Lift Photo is required.");
    }

    if(!formData.LiftDateTxt){
        errors.push("Lift Date is required.");
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

    data.append("LocoNumber", formData.LocoNumTxt);
    data.append("InventoryNumber", formData.InventoryNumTxt);
    data.append("NetBookValue", formData.NetBookVal);
    data.append("GpsLatitude", formData.GpsLat??1.0);
    data.append("GpsLongitude", formData.GpsLong??1.0);

    // files - append only real File objects. If missing, backend handles "No Photo" or "N/A"
    if (formData.LocoPhoto) data.append("LocoPhoto", formData.LocoPhoto);
    if (formData.BodyPhoto1) data.append("BodyPhoto1", formData.BodyPhoto1);
    if (formData.BodyPhoto2) data.append("BodyPhoto2", formData.BodyPhoto2);
    if (formData.BodyPhoto3) data.append("BodyPhoto3", formData.BodyPhoto3);

    data.append("BodyDamage", formData.BodyDamageTxt);
    data.append("LocoClass", formData.LocoClassTxt);
    data.append("LocoModel", formData.LocoModelTxt);

    if (formData.LiftingPhoto) data.append("LiftPhoto", formData.LiftingPhoto);
      data.append("LiftDate", liftDate);

    try {
      const res = await axios.post("/LocoInfoCapture/submit", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const meta = res.data || {};
      setResponseMeta(meta);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);

      console.error("Submit error:", err);
       const isOffline =
    !navigator.onLine ||
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK";

  if (isOffline) {
    const offlineData = JSON.parse(localStorage.getItem("offlineLocoCaptureForms") || "[]");
        offlineData.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem("offlineLocoCaptureForms", JSON.stringify(offlineData));
        alert("No internet connection. Data saved locally and will sync automatically.");
        setShowSuccess(true);
  }else
  {
      setErrorMessages(["Error submitting loco info. See console for details."]);
      setShowError(true);
}
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);

    if(formData.LocoModelTxt === "E18") {
        navigate("/E18BD001");
        return;
    }
    else if(formData.LocoModelTxt === "GE34") {
        navigate("/GE34BD001");
        return;
    }
    else if (formData.LocoModelTxt === "GE35") {
      navigate("/GE35BD001");
      return;
    }
    else if (formData.LocoModelTxt === "GE36") {
      navigate("/GE36BD001");
      return;
    }
    else if (formData.LocoModelTxt === "GM34") {
      navigate("/inspect/BD001");
      return;
    }
    else if (formData.LocoModelTxt === "GM35") {
      navigate("/inspectGm35/WA001");
      return;
    }
    else if (formData.LocoModelTxt === "GM36") {
      navigate("/inspectGm36/WA001");
      return;
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Form className="p-4 border rounded shadow-sm" style={{ maxWidth: "600px", width: "100%", backgroundColor: "white", marginBottom: "3rem" }}>
        <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>Info Capture</h3>

        <Form.Group className="mb-3">
          <Form.Label>Loco Number</Form.Label>
          <Form.Control type="text" name="LocoNumTxt" value={formData.LocoNumTxt} readOnly />
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

        <Form.Group className="mb-3">
          <Form.Label>Loco Photo</Form.Label>
          <Form.Control type="file" name="LocoPhoto" accept="image/*" capture="environment" onChange={handleFileChange} />
          {formData.LocoPhotoPreview && <img src={formData.LocoPhotoPreview} alt="Loco Preview" style={{ marginTop: "10px", maxWidth: "100%", height: "auto" }} />}
        </Form.Group>

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
          <Form.Label>Loco Class</Form.Label>
          <Form.Control type="text" name="LocoClassTxt" value={formData.LocoClassTxt} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Loco Model</Form.Label>
          <Form.Control type="text" name="LocoModelTxt" value={formData.LocoModelTxt} readOnly />
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
          <Modal.Body>Loco info capture has been submitted successfully.</Modal.Body>
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
}

export default LocoInfoCapture;