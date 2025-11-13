import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import axios from "../../api/axios";
import Loader from "../../components/Loader";

// 🔹 Define form order
export const FORM_ORDER = [
  "BD001", "FL001", "BE001", "EE001", "LV001", "CR001",
  "HV001", "MA001", "EH001", "MB001", "HS001", "ES001",
  "HC001", "CC001", "CT001", "RF001"
];

// 🔹 Form labels
export const FORM_LABELS = {
  BD001: "Below Deck Walk Around Loco",
  FL001: "Front of Loco Above",
  BE001: "Back of Loco No.2 End",
  EE001: "18E Cab",
  LV001: "Low Voltage Compartment",
  CR001: "Corridor",
  HV001: "HT High Voltage Compartment No",
  MA001: "Motor Alternator Set",
  EH001: "Exhauster",
  MB001: "Machine Brake Compartment",
  HS001: "High Speed Circuit Breaker Compartment",
  ES001: "Exciter Set 2",
  HC001: "High Voltage Compartment No 1",
  CC001: "Compressor Compartment",
  CT001: "Cab and Toilet No 1 End",
  RF001: "Roof Top Inspect",
};

const E18WalkInspectForm = () => {
  const { formID } = useParams();
  const navigate = useNavigate();

  const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
  const storedLocoClass = localStorage.getItem("locoClass") ?? "";
  const storedLocoModel = localStorage.getItem("locoModel") ?? "";
  const storedUserId = localStorage.getItem("userId") ?? "";

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
        const res = await axios.get(`E18Inspect/getParts/${formID}`);
        const parts = Array.isArray(res.data) ? res.data : [];
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

  // 🔹 Handle “Select All” Header
  const handleSelectAllHeader = (field, checked) => {
    // Uncheck all other headers
    const newSelectState = {
      Good: false,
      Refurbish: false,
      Missing: false,
      Damage: false,
      [field]: checked,
    };
    setSelectAll(newSelectState);

    // Update all rows accordingly
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        Good: field === "Good" ? checked : false,
        Refurbish: field === "Refurbish" ? checked : false,
        Missing: field === "Missing" ? checked : false,
        Damage: field === "Damage" ? checked : false,
      }))
    );

    // Open photo modal for Missing/Damage
    if (checked && (field === "Missing" || field === "Damage")) {
      openPhotoModal(null, field); // header-level = no rowId
    }
  };

  // 🔹 Handle Row Checkbox
  const handleCheckboxChange = (rowId, field) => {
    setSelectAll({
      Good: false,
      Refurbish: false,
      Missing: false,
      Damage: false,
    });

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

  // 🔹 Photo Input Change
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // 🔹 Save Photo Modal
  const handleSavePhotoModal = async () => {
    if (!photoFile || !modalPhotoType) return;

    // ✅ Determine correct partId
    let partId = "";
    if (modalRowId != null) {
      const selectedRow = rows.find((r) => r.id === modalRowId);
      partId = selectedRow?.PartId || "";
    } else {
      partId = rows?.length > 0 ? rows[0].PartId : "";
    }

    if (!partId) {
      alert("Unable to determine Part ID. Please try again.");
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
      const res = await axios.post("E18Inspect/UploadPhoto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedPath = res.data?.path ?? null;

      if (modalRowId != null) {
        // Photo uploaded for one row
        setRows((prev) =>
          prev.map((r) =>
            r.id === modalRowId
              ? modalPhotoType === "Missing"
                ? { ...r, MissingPhoto: uploadedPath }
                : { ...r, DamagePhoto: uploadedPath }
              : r
          )
        );
      } else {
        // Photo uploaded from header-level select all
        setRows((prev) =>
          prev.map((r) =>
            modalPhotoType === "Missing"
              ? { ...r, MissingPhoto: uploadedPath }
              : { ...r, DamagePhoto: uploadedPath }
          )
        );
      }

      setShowPhotoModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Photo upload failed. Please try again.");
    }
  };

  // 🔹 Validate Photos
  const validatePhotos = () => {
    const hasMissingOrDamage = rows.some((r) => r.Missing || r.Damage);
    const hasPhoto = rows.some((r) => r.MissingPhoto || r.DamagePhoto);
    if (hasMissingOrDamage && !hasPhoto) {
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
        ReplaceCheck: r.Damage ? "Yes" : "No",
        MissingPhoto: r.MissingPhoto,
        ReplacePhoto: r.DamagePhoto,
      }));

      await axios.post("E18Inspect/SubmitInspection", dtos);
      alert("Inspection submitted successfully!");

      const currentIdx = FORM_ORDER.indexOf(formID);
      const nextForm = FORM_ORDER[currentIdx + 1];
      if (nextForm) navigate(`/inspectE18/${nextForm}`);
      else {
        alert("✅ All inspections completed!");
        if (formID?.trim().toUpperCase() === "RF001") {
          await axios.post(
            `Dashboard/insertLoco?locoNumber=${encodeURIComponent(
              parseInt(storedLocoNumber)
            )}&userId=${encodeURIComponent(storedUserId)}`
          );
          await axios.post(
            "QuotePdf/GenerateAndSaveQuotePdfForLocos",
            parseInt(storedLocoNumber),
            {
              headers: { "Content-Type": "application/json" },
            }
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
        ) : (
          <div style={{ height: 580, background: "#fff", borderRadius: 8, padding: 8 }}>
            <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
          </div>
        )}

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
              {modalRowId != null && (
                <> for {rows.find((r) => r.id === modalRowId)?.PartId}</>
              )}
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

export default E18WalkInspectForm;
