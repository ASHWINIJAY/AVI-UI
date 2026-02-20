import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery"; 
import axios from "../../api/axios";
import Loader from "../../components/Loader";

const FORM_ORDER = [
  "BD001", "FL001", "SN001", "CL001", "EL001", "BS001",
  "LM001", "CB001", "TR001", "MP001", "BL001", "CA001",
  "ED001", "CF001", "DE001", "RF001"
];

const FORM_LABELS = {
  BD001: "Below Deck From No.1A to 1B",
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
  DE001: "No.2 End above deck",
  RF001: "Roof Top Inspect",
};

const GM34InspectForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const storedUserId = localStorage.getItem("userId") ?? "";
 const storedPhase = localStorage.getItem("phase") ?? "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectAll, setSelectAll] = useState({
    Good: false,
    Refurbish: false,
    Missing: false,
    Damage: false,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalPhotoType, setModalPhotoType] = useState(null);
  const [modalRowId, setModalRowId] = useState(null);


  // 🔹 Fetch Parts
  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`GM34Inspect/getParts/${formID}`);
        const parts = Array.isArray(res.data) ? res.data : [];
        setSelectAll({
    Good: false,
    Refurbish: false,
    Missing: false,
    Damage: false,
  });

        const prepared = parts.map((p, idx) => ({
          id: idx + 1,
          PartId: p.partId ?? p.PartId ?? "",
          PartDescr: p.partDescr ?? p.PartDescr ?? "",
          Good: false,
          Refurbish: false,
          Missing: false,
          Damage: false,
          MissingPhoto: null,
          DamagePhoto: null,
        }));
        setRows(prepared);
      } catch {
        alert("Failed to load parts.");
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [formID]);
const validateAtLeastOneChecked = () => {
  const invalidRows = rows.filter(
    (r) => !r.Good && !r.Refurbish && !r.Missing && !r.Damage
  );

  if (invalidRows.length > 0) {
    alert(
      `Please select at least one option for all parts.\nMissing selection in ${invalidRows.length} row(s).`
    );
    return false;
  }

  return true;
};



  // 🔹 Handle “Select All” Header
  const handleSelectAllHeader = (field, checked) => {
    const newState = {
      Good: false,
      Refurbish: false,
      Missing: false,
      Damage: false,
      [field]: checked,
    };
    setSelectAll(newState);

    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        Good: field === "Good" ? checked : false,
        Refurbish: field === "Refurbish" ? checked : false,
        Missing: field === "Missing" ? checked : false,
        Damage: field === "Damage" ? checked : false,
      }))
    );

    if (checked && (field === "Missing" || field === "Damage")) {
      openPhotoModal(null, field);
    }
  };

  // 🔹 Handle Row Checkbox
  const handleCheckboxChange = (rowId, field) => {
    setSelectAll({ Good: false, Refurbish: false, Missing: false, Damage: false });

    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              Good: false,
              Refurbish: false,
              Missing: false,
              Damage: false,
              [field]: !r[field],
            }
          : r
      )
    );

    const currentRow = rows.find((r) => r.id === rowId);
    if (!currentRow) return;

    if (!currentRow[field] && (field === "Missing" || field === "Damage")) {
      openPhotoModal(rowId, field);
    }
  };

  // 🔹 Open Photo Modal
  const openPhotoModal = (rowId = null, type) => {
    setModalRowId(rowId);
    setModalPhotoType(type);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPhotoModal(true);
  };

  // 🔹 Photo File Change
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // 🔹 Save Photo
  const handleSavePhotoModal = async () => {
    if (!photoFile || !modalPhotoType) return;

    let partId = "";
    if (modalRowId != null) {
      const selectedRow = rows.find((r) => r.id === modalRowId);
      partId = selectedRow?.PartId || "";
    } else {
      partId = rows?.[0]?.PartId || "";
    }

    if (!partId) {
      alert("Unable to determine Part ID.");
      return;
    }

    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("formId", formID);
    fd.append("partId", partId);
    fd.append("photoType", modalPhotoType);
    fd.append("locoNumber", storedLocoNumber);
    fd.append("locoModel", storedLocoModel);

    try {
      const res = await axios.post("GM34Inspect/UploadPhoto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedPath = res.data?.path ?? null;

      setRows((prev) =>
        prev.map((r) => {
          if (modalRowId == null) {
            return modalPhotoType === "Missing"
              ? { ...r, MissingPhoto: uploadedPath }
              : { ...r, DamagePhoto: uploadedPath };
          }

          if (r.id === modalRowId) {
            return modalPhotoType === "Missing"
              ? { ...r, MissingPhoto: uploadedPath }
              : { ...r, DamagePhoto: uploadedPath };
          }

          return r;
        })
      );

      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch {
      alert("Photo upload failed.");
    }
  };

  // 🔹 Validate Photos
  const validatePhotos = () => {
    const hasIssue = rows.some((r) => r.Missing || r.Damage);
    const hasPhoto = rows.some((r) => r.MissingPhoto || r.DamagePhoto);

    if (hasIssue && !hasPhoto) {
      alert("Please upload at least one photo for Missing or Damaged parts.");
      return false;
    }
    return true;
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!storedLocoNumber || !storedUserId) {
      alert("Missing loco or user info.");
      return;
    }
    if (!validateAtLeastOneChecked()) return;
    if (!validatePhotos()) return;

    setSubmitting(true);
    try {
      const dtos = rows.map((r) => ({
        LocoNumber: storedLocoNumber,
        LocoClass: storedLocoClass,
        LocoModel: storedLocoModel,
        FormId: formID,
        PartId: r.PartId,
        PartDescr: r.PartDescr,
        GoodCheck: r.Good ? "Yes" : "No",
        RefurbishCheck: r.Refurbish ? "Yes" : "No",
        MissingCheck: r.Missing ? "Yes" : "No",
        DamageCheck: r.Damage ? "Yes" : "No",
        MissingPhoto: r.MissingPhoto,
        ReplacePhoto: r.DamagePhoto,
         LaborValue: r.LaborValue ?? "0.00",
         Phase: parseInt(storedPhase)
      }));

await axios.post("GM34Inspect/SubmitInspection", dtos);
      alert("Inspection submitted successfully!");

      const currentIdx = FORM_ORDER.indexOf(formID);
      const nextForm = FORM_ORDER[currentIdx + 1];
      if (nextForm) navigate(`/inspect/${nextForm}`);
      else {
        alert("✅ All inspections completed!");
        if (formID?.trim().toUpperCase() === "RF001") {
          await axios.post(
            `LocoDash/insertLoco?locoNumber=${encodeURIComponent(
              parseInt(storedLocoNumber)
            )}&userId=${encodeURIComponent(storedUserId)}`
          );
       
          navigate("/choose");
        }
      }
    } catch {
      alert("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };
  // 🔹 DataGrid Columns
  const columns = [
    { field: "id", headerName: "No.", width: 70 },
    { field: "PartId", headerName: "Part ID", width: 120 },
    { field: "PartDescr", headerName: "Description", flex: 1 },
    ...["Good", "Refurbish", "Missing", "Damage"].map((field) => ({
      field,
      headerName: field,
      width: 120,
      renderHeader: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <input
            type="checkbox"
            checked={selectAll[field]}
            onChange={(e) => handleSelectAllHeader(field, e.target.checked)}
          />
          <strong>{field}</strong>
        </div>
      ),
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={params.row[field]}
          onChange={() => handleCheckboxChange(params.row.id, field)}
        />
      ),
    })),
  ];

  return (
    <>
      {loading && <Loader fullscreen />}

      <Container className="mt-4 mb-5">
        <h3 className="text-center text-white mb-3">{FORM_LABELS[formID]}</h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Spinner animation="border" />
          </div>
        ) : isMobile ? (
          <>
            {/* 🔹 MOBILE VIEW — HEADER SELECT ALL */}
            <div style={{ marginBottom: 10, color: "white", display: "flex", gap: 10 }}>
              <strong>Select All:</strong>
            </div>

            <div
              style={{
                background: "#fff",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            >
              {["Good", "Refurbish", "Missing", "Damage"].map((field) => (
                <label key={field} style={{ marginRight: 15 }}>
                  <input
                    type="checkbox"
                    checked={selectAll[field]}
                    onChange={(e) => handleSelectAllHeader(field, e.target.checked)}
                  />{" "}
                  {field}
                </label>
              ))}
            </div>

            {/* 🔹 MOBILE — CARD LIST */}
            {rows.map((row) => (
              <div
                key={row.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  background: "#fff",
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <strong>{row.PartId}</strong> — {row.PartDescr}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {["Good", "Refurbish", "Missing", "Damage"].map((field) => (
                    <label key={field}>
                      <input
                        type="checkbox"
                        checked={row[field]}
                        onChange={() => handleCheckboxChange(row.id, field)}
                      />{" "}
                      {field}
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 8 }}>
                  {row.MissingPhoto && (
                    <div style={{ fontSize: 12, color: "#007bff" }}>
                      Missing photo uploaded
                    </div>
                  )}
                  {row.DamagePhoto && (
                    <div style={{ fontSize: 12, color: "#007bff" }}>
                      Damage photo uploaded
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          /* 🔹 DESKTOP VIEW */
          <div style={{ height: 580, background: "#fff", borderRadius: 8, padding: 8 }}>
            <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
          </div>
        )}

        {/* Bottom Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <Button variant="success" onClick={handleSubmit} disabled={submitting}>
            {formID === "RF001"
              ? submitting
                ? "Submitting..."
                : "Complete"
              : submitting
              ? "Saving..."
              : "Continue →"}
          </Button>
        </div>

        {/* Photo Modal */}
        <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              Upload {modalPhotoType} Photo
              {modalRowId != null && <> for {rows.find((r) => r.id === modalRowId)?.PartId}</>}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <input type="file" accept="image/*;capture=camera" onChange={handlePhotoFileChange} />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                style={{ width: "100%", marginTop: 10, borderRadius: 6 }}
              />
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePhotoModal}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default GM34InspectForm;
