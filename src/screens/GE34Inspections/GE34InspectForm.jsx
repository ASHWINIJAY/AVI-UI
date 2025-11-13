import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../../api/axios";

const FORM_ORDER = [
  "BD001", "FL001", "SN001", "CL001", "EC001", "BS001",
  "OD001", "BC001", "AC001", "ED001", "CF001", "DE001", "RF001"
];

const FORM_LABELS = {
  BD001: "Walk Around / Below Deck Inspect",
  FL001: "Front Loco Inspect",
  SN001: "Short Nose Inspect",
  CL001: "Cab Loco Inspect",
  EC001: "Elect Cab Inspect",
  BS001: "Battery Switch Inspect",
  OD001: "Outside Drivers Door Inspect",
  BC001: "Blower Compartment Inspect",
  AC001: "Alternator Compartment Inspect",
  ED001: "Engine Deck Inspect",
  CF001: "Compressor Fan Inspect",
  DE001: "End Deck Inspect",
  RF001: "Roof Top Inspect"
};

const GE34InspectForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const storedUserId = localStorage.getItem("userId") ?? "";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectAllGood, setSelectAllGood] = useState(false);

  // Photo modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalRowId, setModalRowId] = useState(null);
  const [modalPhotoType, setModalPhotoType] = useState(null); // "Missing" | "Damage"
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // fetch parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`GE34Inspect/getParts/${formID}`);
        const parts = Array.isArray(res.data) ? res.data : [];
        const prepared = parts.map((p, idx) => ({
          id: idx + 1,
          PartId: p.partId ?? p.PartID ?? "",
          PartDescr: p.partDescr ?? p.PartDescr ?? "",
          Good: false,
          Refurbish: false,
          Missing: false,
          Damage: false,
          RefurbishValue: "0.00",
          MissingValue: "0.00",
          ReplaceValue: "0.00",
          MissingPhoto: null,
          DamagePhoto: null,
        }));
        setRows(prepared);
        setSelectAllGood(false);
      } catch (ex) {
        console.error(ex);
        setError("Failed to load parts.");
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [formID]);

  // helper to get cost
  const getPartCost = async (partId, field) => {
    try {
      const res = await axios.get(`GE34Inspect/getPartCost?partId=${encodeURIComponent(partId)}&field=${encodeURIComponent(field)}`);
      return res.data || "0.00";
    } catch (e) {
      return "0.00";
    }
  };

  // delete photo API wrapper
  const deletePhoto = async (path) => {
    if (!path) return;
    try {
      await axios.post("GE34Inspect/DeletePhoto", { path });
    } catch (e) {
      console.warn("DeletePhoto failed", e);
    }
  };

  // The checkbox handler — IMPORTANT: opens modal when Missing/Damage is selected
  const handleCheckboxChange = async (rowId, field) => {
    setError("");
    const current = rows.find(r => r.id === rowId);
    if (!current) return;
    const willBeOn = !current[field];

    // reset all flags & values and remove previous photos when toggling
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
      DamagePhoto: null
    };

    // if user previously had photos, remove them from server when toggling
    if (current.MissingPhoto) await deletePhoto(current.MissingPhoto);
    if (current.DamagePhoto) await deletePhoto(current.DamagePhoto);

    if (!willBeOn) {
      // user unchecked the same checkbox — just apply reset
      setRows(prev => prev.map(r => r.id === rowId ? updated : r));
      return;
    }

    // set selection and fetch costs where needed
    if (field === "Good") {
      updated.Good = true;
    } else if (field === "Refurbish") {
      updated.Refurbish = true;
      updated.RefurbishValue = await getPartCost(current.PartId, "Refurbish");
    } else if (field === "Missing") {
      updated.Missing = true;
      updated.MissingValue = await getPartCost(current.PartId, "Missing");
      // set row state first, then open modal
      setRows(prev => prev.map(r => r.id === rowId ? updated : r));
      openPhotoModal(rowId, "Missing");
      return;
    } else if (field === "Damage") {
      updated.Damage = true;
      updated.ReplaceValue = await getPartCost(current.PartId, "Replace");
      setRows(prev => prev.map(r => r.id === rowId ? updated : r));
      openPhotoModal(rowId, "Damage");
      return;
    }

    setRows(prev => prev.map(r => r.id === rowId ? updated : r));
  };

  // Open modal (sets modal meta and shows)
  const openPhotoModal = (rowId, photoType) => {
    // clear previous preview & file
    try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch {}
    setPhotoPreview(null);
    setPhotoFile(null);

    setModalRowId(rowId);
    setModalPhotoType(photoType); // "Missing" or "Damage"
    setShowPhotoModal(true);
  };

  // file input change
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch {}
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Cancel modal (reset the row flags for the modalRowId)
  const handleCancelPhotoModal = () => {
    try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch {}
    setPhotoPreview(null);
    setPhotoFile(null);

    if (modalRowId != null && modalPhotoType) {
      setRows(prev => prev.map(r => {
        if (r.id !== modalRowId) return r;
        const base = { ...r, [modalPhotoType]: false };
        if (modalPhotoType === "Missing") base.MissingValue = "0.00";
        if (modalPhotoType === "Damage") base.ReplaceValue = "0.00";
        // ensure photo fields cleared
        if (modalPhotoType === "Missing") base.MissingPhoto = null;
        if (modalPhotoType === "Damage") base.DamagePhoto = null;
        return base;
      }));
    }

    setModalRowId(null);
    setModalPhotoType(null);
    setShowPhotoModal(false);
    setError("");
  };

  // Save photo modal — upload and attach to row
  const handleSavePhotoModal = async () => {
    if (!photoFile || modalRowId == null || !modalPhotoType) {
      setError("Photo required.");
      return;
    }
    const row = rows.find(r => r.id === modalRowId);
    if (!row) { setError("Row not found."); return; }

    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("formId", formID);
    fd.append("partId", row.PartId);
    fd.append("photoType", modalPhotoType);
    fd.append("locoNumber", storedLocoNumber);
    fd.append("locoModel", storedLocoModel);

    try {
      const res = await axios.post("GE34Inspect/UploadPhoto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedPath = res.data?.path ?? null;

      setRows(prev => prev.map(r => {
        if (r.id !== modalRowId) return r;
        const copy = { ...r };
        if (modalPhotoType === "Missing") {
          copy.MissingPhoto = uploadedPath;
          copy.Missing = true;
        } else if (modalPhotoType === "Damage") {
          copy.DamagePhoto = uploadedPath;
          copy.Damage = true;
        }
        return copy;
      }));

      // cleanup modal
      try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch {}
      setPhotoPreview(null);
      setPhotoFile(null);
      setModalRowId(null);
      setModalPhotoType(null);
      setShowPhotoModal(false);
      setError("");
    } catch (ex) {
      console.error("Upload failed", ex);
      setError("Upload failed.");
    }
  };

  // Select all Good
  const handleSelectAllGood = (checked) => {
    setSelectAllGood(checked);
    // when selecting all good, clear photos on server for rows that had photos
    (async () => {
      if (checked) {
        for (const r of rows) {
          if (r.MissingPhoto) await deletePhoto(r.MissingPhoto);
          if (r.DamagePhoto) await deletePhoto(r.DamagePhoto);
        }
      }
      setRows(prev => prev.map(r => ({
        ...r,
        Good: checked,
        Refurbish: false,
        Missing: false,
        Damage: false,
        RefurbishValue: "0.00",
        MissingValue: "0.00",
        ReplaceValue: "0.00",
        MissingPhoto: null,
        DamagePhoto: null
      })));
    })();
  };

  // Submit — same behaviour as you had
  const handleSubmit = async () => {
    setError("");
    setInfo("");

    // validation — ensure each row has at least one check
    const invalidRow = rows.find(r => !r.Good && !r.Refurbish && !r.Missing && !r.Damage);
    if (invalidRow) {
      setError("Each row must have at least one checkbox selected.");
      return;
    }

    if (!storedLocoNumber) {
      setError("Missing loco info.");
      return;
    }
    if (!rows || rows.length === 0) {
      setError("No parts to submit.");
      return;
    }

    setSubmitting(true);
    try {
      const dtos = rows.map(r => ({
        LocoNumber: parseInt(storedLocoNumber, 10),
        LocoModel: storedLocoModel ?? "",
        LocoClass: storedLocoClass ?? "",
        FormId: formID,
        PartId: r.PartId,
        PartDescr: r.PartDescr ?? "",
        GoodCheck: r.Good ? "Yes" : "No",
        RefurbishCheck: r.Refurbish ? "Yes" : "No",
        MissingCheck: r.Missing ? "Yes" : "No",
        ReplaceCheck: r.Damage ? "Yes" : "No",
        RefurbishValue: String(r.RefurbishValue ?? "0.00"),
        MissingValue: String(r.MissingValue ?? "0.00"),
        ReplaceValue: String(r.ReplaceValue ?? "0.00"),
        MissingPhoto: r.MissingPhoto,
        ReplacePhoto: r.DamagePhoto,
        CreatedBy: storedUserId
      }));

      await axios.post("GE34Inspect/SubmitInspection", dtos);
      //setInfo("Inspection saved successfully!");

      // navigate to next or finish
      const idx = FORM_ORDER.indexOf(formID);
      const next = FORM_ORDER[idx + 1];
      if (formID === "RF001") {
         alert("✅ All inspections completed!");
        // call Dashboard insert if needed and go choose
        await axios.post(`Dashboard/insertLoco?locoNumber=${encodeURIComponent(parseInt(storedLocoNumber, 10))}&userId=${encodeURIComponent(storedUserId)}`);
        axios.post("QuotePdf/GenerateAndSaveQuotePdfForLocos", parseInt(storedLocoNumber), {
                 headers: {
                     "Content-Type": "application/json"
                 }
             })
        navigate("/choose");
      } else if (next) {
        navigate(`/inspectGe34/${next}`);
      }
    } catch (ex) {
      console.error(ex);
      setError("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // DataGrid columns
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
          <input type="checkbox" checked={selectAllGood} onChange={(e) => handleSelectAllGood(e.target.checked)} />
          <strong>Good</strong>
        </div>
      ),
      renderCell: (params) => (
        <input type="checkbox" checked={!!params.row.Good} onChange={() => handleCheckboxChange(params.row.id, "Good")} />
      ),
    },
    {
      field: "Refurbish",
      headerName: "Refurbish",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={!!params.row.Refurbish} onChange={() => handleCheckboxChange(params.row.id, "Refurbish")} />
      ),
    },
    {
      field: "Missing",
      headerName: "Missing",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={!!params.row.Missing} onChange={() => handleCheckboxChange(params.row.id, "Missing")} />
      ),
    },
    {
      field: "Damage",
      headerName: "Damage",
      width: 120,
      renderCell: (params) => (
        <input type="checkbox" checked={!!params.row.Damage} onChange={() => handleCheckboxChange(params.row.id, "Damage")} />
      ),
    },
  ];

  return (
    <Container className="mt-4 mb-5">
      <h3 className="text-center text-white mb-3">{FORM_LABELS[formID] ?? formID}</h3>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {info && <div style={{ color: "green", marginBottom: 8 }}>{info}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}><Spinner animation="border" /></div>
      ) : (
        <div style={{ height: 580, background: "#fff", borderRadius: 8, padding: 8 }}>
          <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
        <Button variant="success" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : (formID === "RF001" ? "Complete" : "Continue →")}
        </Button>
      </div>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={handleCancelPhotoModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Photo ({modalPhotoType ?? ""})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error === "Photo required." && <div style={{ color: "red", marginBottom: 8 }}>Photo required</div>}
          <input
            key={`${modalRowId || "none"}_${modalPhotoType || "none"}`} // force re-render so same file can be re-selected
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoFileChange}
            style={{ width: "100%" }}
          />
          {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: "100%", marginTop: 12, borderRadius: 6 }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelPhotoModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePhotoModal}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GE34InspectForm;
