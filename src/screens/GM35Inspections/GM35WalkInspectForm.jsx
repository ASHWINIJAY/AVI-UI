import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../../api/axios";

const FORM_ORDER = [
  "WA001", "FL001", "SN001", "CL001", "EL001", "BS001",
  "LM001", "CB001", "TR001", "MP001", "BL001", "CA001",
  "ED001", "CF001", "DE001", "RF001"
];

const FORM_LABELS = {
  WA001: "Below Deck From No.1A to 1B",
  FL001: "Front of Loco Above",
  SN001: "Short Nose",
  CL001: "Cab of Loco Assistant Entrance",
  EL001: "Elect Cabinet Top Left",
  BS001: "Battery Knife Switch Compartment",
  LM001: "Left Middle Door",
  CB001: "Circuit Breaker Control Panel",
  TR001: "Top Right Panel",
  MP001: "Middle Panel",
  BL001: "Bottom Left Panel",
  CA001: "Central Air Compartment",
  ED001: "Engine and Above Deck",
  CF001: "Compressor Fan Rad Compartment",
  DE001: "No.2 End Above Deck",
  RF001: "Roof Top Inspect",
};

const GM35WalkInspectForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const userId = localStorage.getItem("userId") ?? "";
const storedUserId = localStorage.getItem("userId") ?? "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAllGood, setSelectAllGood] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalRowId, setModalRowId] = useState(null);
  const [modalPhotoType, setModalPhotoType] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showConfirmBackModal, setShowConfirmBackModal] = useState(false);

  // 🔹 Fetch Parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`GM35Inspect/getParts/${formID}?t=${Date.now()}`);
        const data = Array.isArray(res.data) ? res.data : [];
        const prepared = data
          .map((p, idx) => ({
            id: idx + 1,
            PartId: (p.PartId ?? p.partId ?? "").toString(),
            PartDescr: p.PartDescr ?? p.partDescr ?? "",
            Good: false,
            Refurbish: false,
            Missing: false,
            Damage: false,
            RefurbishValue: "0.00",
            MissingValue: "0.00",
            ReplaceValue: "0.00",
            DamagePhoto: null,
            MissingPhoto: null,
          }))
          .sort((a, b) => {
            const numA = parseInt((a.PartId.match(/\d+/) || ["0"])[0], 10);
            const numB = parseInt((b.PartId.match(/\d+/) || ["0"])[0], 10);
            if (numA === numB) return a.PartId.localeCompare(b.PartId);
            return numA - numB;
          });
        setRows(prepared);
        setSelectAllGood(false);
      } catch {
        setError("Failed to load parts.");
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [formID]);

  const getPartCost = async (partId, field) => {
    try {
      const res = await axios.get(`GM35Inspect/getPartCost?partId=${encodeURIComponent(partId)}&field=${encodeURIComponent(field)}`);
      if (typeof res.data === "number") return res.data.toFixed(2);
      return String(res.data ?? "0.00");
    } catch {
      return "0.00";
    }
  };

  const uploadPhoto = async (file, partId, photoType) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("formId", formID);
      fd.append("partId", partId);
      fd.append("photoType", photoType);
      fd.append("locoNumber", storedLocoNumber);
      fd.append("locoModel", storedLocoModel);

      const res = await axios.post("GM35Inspect/UploadPhoto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.path ?? null;
    } catch {
      setError("Photo upload failed.");
      return null;
    }
  };

  const deletePhoto = async (path) => {
    if (!path) return;
    try {
      await axios.post("GM35Inspect/DeletePhoto", { path });
    } catch {}
  };

  const handleCheckboxChange = async (rowId, field) => {
    setError("");
    const current = rows.find(r => r.id === rowId);
    if (!current) return;
    const willBeOn = !current[field];

    let updated = {
      ...current,
      Good: false,
      Refurbish: false,
      Missing: false,
      Damage: false,
      RefurbishValue: "0.00",
      MissingValue: "0.00",
      ReplaceValue: "0.00",
      MissingPhoto: null,
      DamagePhoto: null,
    };

    if (field === "Good") updated.Good = willBeOn;
    else if (field === "Refurbish") {
      updated.Refurbish = willBeOn;
      updated.RefurbishValue = willBeOn ? await getPartCost(current.PartId, "Refurbish") : "0.00";
    } else if (field === "Missing") {
      updated.Missing = willBeOn;
      updated.MissingValue = willBeOn ? await getPartCost(current.PartId, "Missing") : "0.00";
      if (willBeOn) openPhotoModal(rowId, "Missing");
    } else if (field === "Damage") {
      updated.Damage = willBeOn;
      updated.ReplaceValue = willBeOn ? await getPartCost(current.PartId, "Replace") : "0.00";
      if (willBeOn) openPhotoModal(rowId, "Damage");
    }

    setRows(prev => prev.map(r => (r.id === rowId ? updated : r)));
  };

  const handleSelectAllGood = (checked) => {
    setSelectAllGood(checked);
    setRows(prev => prev.map(r => ({
      ...r,
      Good: checked,
      Refurbish: false,
      Missing: false,
      Damage: false,
      RefurbishValue: "0.00",
      MissingValue: "0.00",
      ReplaceValue: "0.00",
    })));
  };

  const openPhotoModal = (rowId, type) => {
    setModalRowId(rowId);
    setModalPhotoType(type);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPhotoModal(true);
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const handleSavePhotoModal = async () => {
    if (!photoFile || !modalRowId || !modalPhotoType) {
      setError("Photo required.");
      return;
    }
    const row = rows.find(r => r.id === modalRowId);
    if (!row) return;
    const uploadedPath = await uploadPhoto(photoFile, row.PartId, modalPhotoType);
    if (!uploadedPath) return;

    setRows(prev =>
      prev.map(r =>
        r.id === modalRowId
          ? { ...r, [modalPhotoType === "Missing" ? "MissingPhoto" : "DamagePhoto"]: uploadedPath }
          : r
      )
    );
    setShowPhotoModal(false);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    const invalid = rows.find(r => !r.Good && !r.Refurbish && !r.Missing && !r.Damage);
    if (invalid) {
      setShowValidationModal(true);
      return;
    }
    setSubmitting(true);
    try {
      const dtos = rows.map(r => ({
        LocoNumber: storedLocoNumber,
        LocoClass: storedLocoClass,
        LocoModel: storedLocoModel,
        FormId: formID,
        PartId: r.PartId,
        PartDescr: r.PartDescr,
        GoodCheck: r.Good ? "Yes" : "No",
        RefurbishCheck: r.Refurbish ? "Yes" : "No",
        MissingCheck: r.Missing ? "Yes" : "No",
        ReplaceCheck: r.Damage ? "Yes" : "No",
        RefurbishValue: String(r.RefurbishValue ?? "0.00"),
        MissingValue: String(r.MissingValue ?? "0.00"),
        ReplaceValue: String(r.ReplaceValue ?? "0.00"),
        MissingPhoto: r.MissingPhoto ?? "No Photo",
        ReplacePhoto: r.DamagePhoto ?? "No Photo",
      }));

      await axios.post("GM35Inspect/SubmitInspection", dtos);
      setInfo("Inspection submitted successfully!");
      const next = FORM_ORDER[FORM_ORDER.indexOf(formID) + 1];
      if (next) navigate(`/inspectGm35/${next}`);
      const cleanFormID = formID?.trim().toUpperCase();
     
if (cleanFormID === "RF001") {
 const res = await axios.post(`Dashboard/insertLoco?locoNumber=${encodeURIComponent(parseInt(storedLocoNumber))}&userId=${encodeURIComponent(storedUserId)}`);
  navigate("/choose");
}
    } catch {
      setError("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => setShowConfirmBackModal(true);

  const confirmGoBack = async () => {
    for (const r of rows) {
      if (r.MissingPhoto) await deletePhoto(r.MissingPhoto);
      if (r.DamagePhoto) await deletePhoto(r.DamagePhoto);
    }
    navigate(-1);
  };

  const columns = [
    { field: "id", headerName: "No.", width: 70 },
    { field: "PartId", headerName: "Part ID", width: 120 },
    { field: "PartDescr", headerName: "Description", flex: 1 },
    {
      field: "Good",
      headerName: "Good",
      width: 100,
      renderHeader: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input type="checkbox" checked={selectAllGood} onChange={(e) => handleSelectAllGood(e.target.checked)} /> <strong>Good</strong>
        </div>
      ),
      renderCell: (params) => (
        <input type="checkbox" checked={params.row.Good} onChange={() => handleCheckboxChange(params.row.id, "Good")} />
      ),
    },
    { field: "Refurbish", headerName: "Refurbish", width: 120, renderCell: (p) => <input type="checkbox" checked={p.row.Refurbish} onChange={() => handleCheckboxChange(p.row.id, "Refurbish")} /> },
    { field: "Missing", headerName: "Missing", width: 120, renderCell: (p) => <input type="checkbox" checked={p.row.Missing} onChange={() => handleCheckboxChange(p.row.id, "Missing")} /> },
    { field: "Damage", headerName: "Damage", width: 120, renderCell: (p) => <input type="checkbox" checked={p.row.Damage} onChange={() => handleCheckboxChange(p.row.id, "Damage")} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container className="mt-4 mb-4">
        <h3 className="text-center mb-4" style={{ color: "white" }}>{FORM_LABELS[formID]}</h3>
        {info && <div style={{ color: "green", background: "white", marginBottom: 8 }}>{info}</div>}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><Spinner animation="border" /></div>
        ) : (
          <div style={{ height: 580, width: "100%", background: "#fff", borderRadius: 8, padding: 8 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
            />
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <Button variant="secondary" onClick={handleBackClick}>Back</Button>
          <Button
  variant={formID === "RF001" ? "primary" : "success"}
  onClick={handleSubmit}
  disabled={submitting}
>
  {submitting
    ? "Submitting..."
    : formID === "RF001"
    ? "Complete ✅"
    : "Continue →"}
</Button>

        </div>
      </Container>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Upload {modalPhotoType} Photo</Modal.Title></Modal.Header>
        <Modal.Body>
          <input type="file" accept="image/*;capture=camera"onChange={handlePhotoFileChange} />
          {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: "100%", marginTop: 10, borderRadius: 6 }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePhotoModal}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Validation Modal */}
      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Validation Error</Modal.Title></Modal.Header>
        <Modal.Body>Each row must have at least one checkbox selected before continuing.</Modal.Body>
        <Modal.Footer><Button variant="primary" onClick={() => setShowValidationModal(false)}>OK</Button></Modal.Footer>
      </Modal>

      {/* Confirm Back Modal */}
      <Modal show={showConfirmBackModal} onHide={() => setShowConfirmBackModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Navigation</Modal.Title></Modal.Header>
        <Modal.Body>
          Are you sure you want to go back?<br />
          <strong>All entered data and photos will be lost.</strong>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmBackModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmGoBack}>Yes, Go Back</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GM35WalkInspectForm;
