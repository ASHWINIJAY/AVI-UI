import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Form,
  Modal,
  Image,
  Alert,
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../api/axios";

const formIdsByLocoModel = {
  GE34: ["BD001", "FL001", "SN001", "CL001", "EC001", "BS001", "OD001", "BC001", "AC001", "ED001", "CF001", "DE001", "RF001"],
  GM34: ["BD001", "FL001", "SN001", "CL001", "EL001", "BS001", "LM001", "CB001", "TR001", "MP001", "BL001", "CA001", "ED001", "CF001", "DE001", "RF001"],
  GE35: ["BD001", "FL001", "SN001", "CL001", "EC001", "BS001", "OD001", "BC001", "MG001", "ED001", "CF001", "DE001", "RF001"],
  GM35: ["WA001", "FL001", "SN001", "CL001", "EL001", "BS001", "LM001", "CB001", "TR001", "MP001", "BL001", "CA001", "ED001", "CF001", "DE001", "RF001"],
  GE36: ["BD001", "FL001", "SN001", "CL001", "EC001", "CA001", "MG001", "ED001", "CF001", "DE001", "RF001"],
  GM36: ["WA001", "FL001", "SN001", "BV001", "CL001", "EC001", "CB001", "BS001", "LM001", "LC001", "TR001","BP001", "CA001", "ED001", "CF001", "DE001", "RF001"],
  E18: ["BD001", "FL001", "BE001", "EE001", "LV001", "CR001", "HV001", "MA001", "EH001", "MB001", "ES001", "HC001", "CC001", "CT001", "RF001"]
};

const InspectionProcess = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const locoModel = (localStorage.getItem("locoModel") || "").trim();
  const locoNumber = parseInt(localStorage.getItem("locoNumber") || "0", 10);
  const userId = localStorage.getItem("userId") || "";
  const locoClass = (localStorage.getItem("locoClass") || "").trim();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [selectAllGood, setSelectAllGood] = useState(false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [modalRowId, setModalRowId] = useState(null);
  const [modalPhotoType, setModalPhotoType] = useState(null);
  const fileInputRef = useRef(null);

  const { formId: paramFormId } = useParams();
  const [effectiveFormId, setEffectiveFormId] = useState(() => {
    if (paramFormId?.trim()) return paramFormId.trim();
    return locoModel && formIdsByLocoModel[locoModel]?.length
      ? formIdsByLocoModel[locoModel][0]
      : null;
  });

  const fetchedRef = useRef(false);
  const mountedRef = useRef(true);

  // Fetch parts on load
  useEffect(() => {
    mountedRef.current = true;
    const loadParts = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;

      setLoading(true);
      setError("");
      try {
        if (!locoModel || !effectiveFormId) {
          if (mountedRef.current) {
            setError("Missing Loco Model or Form ID.");
            setRows([]);
            setLoading(false);
          }
          return;
        }

        const res = await axios.get(
          `Inspection/GetParts?locoModel=${encodeURIComponent(
            locoModel
          )}&formId=${encodeURIComponent(effectiveFormId)}&_=${Date.now()}`
        );

        const data = Array.isArray(res.data) ? res.data : [];
        const prepared = data.map((p, idx) => ({
          id: idx + 1,
          PartId: p.PartId ?? p.PartID ?? p.partId ?? "",
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
        }));

        if (mountedRef.current) {
          setRows(prepared);
          setSelectAllGood(false);
        }
      } catch (ex) {
        console.error("GetParts error", ex);
        if (mountedRef.current) setError("Failed to load parts for this form.");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    loadParts();

    return () => {
      mountedRef.current = false;
    };
  }, [effectiveFormId, locoModel]);

  useEffect(() => {
    const allGood = rows.length > 0 && rows.every(r => r.Good);
    setSelectAllGood(allGood);
  }, [rows]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const getPartCost = async (partId, field) => {
    try {
      const res = await axios.get(
        `Inspection/GetPartCost?locoModel=${encodeURIComponent(
          locoModel
        )}&partId=${encodeURIComponent(partId)}&field=${encodeURIComponent(
          field
        )}`
      );
      if (typeof res.data === "string") return res.data || "0.00";
      if (res.data && typeof res.data === "object") {
        return res.data.refurbishCost ?? res.data.value ?? "0.00";
      }
      return "0.00";
    } catch (ex) {
      console.error("GetPartCost failed", ex);
      return "0.00";
    }
  };

  const uploadPhoto = async (file, partId, photoType) => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("locoModel", locoModel);
      fd.append("formId", effectiveFormId);
      fd.append("partId", partId);
      fd.append("photoType", photoType);
      fd.append("locoNumber", String(locoNumber));

      const res = await axios.post("Inspection/UploadPhoto", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.path) return res.data.path;
      if (typeof res.data === "string") return res.data;
      return null;
    } catch (ex) {
      console.error("UploadPhoto failed", ex);
      setError("Photo upload failed.");
      return null;
    }
  };

  const deletePhoto = async (photoPath) => {
    if (!photoPath) return;
    try {
      await axios.post("Inspection/DeletePhoto", { path: photoPath });
    } catch (ex) {
      console.warn("DeletePhoto failed (non-blocking)", ex);
    }
  };

  const getPhotoDisplay = (row) => {
    if (row.MissingPhoto) return { text: "Missing Photo saved", url: row.MissingPhoto };
    if (row.DamagePhoto) return { text: "Damage Photo saved", url: row.DamagePhoto };
    return { text: "No Photo", url: null };
  };

  const handleSelectAllGood = (checked) => {
    setSelectAllGood(checked);
    setRows(prev =>
      prev.map(r => ({
        ...r,
        Good: checked,
        Refurbish: false,
        Missing: false,
        Damage: false,
        RefurbishValue: "0.00",
        MissingValue: "0.00",
        ReplaceValue: "0.00",
      }))
    );
  };

  const handleCheckboxChange = async (rowId, field) => {
    setError("");
    setInfo("");

    const current = rows.find(r => r.id === rowId);
    if (!current) return;
    const partId = current.PartId;
    const willBeOn = !current[field];

    // If unchecking Missing/Damage, delete photo
    if (!willBeOn && (field === "Missing" || field === "Damage")) {
      const photoField = field === "Missing" ? "MissingPhoto" : "DamagePhoto";
      const photoPath = current[photoField];
      if (photoPath) await deletePhoto(photoPath);
      setRows(prev =>
        prev.map(r =>
          r.id === rowId
            ? {
                ...r,
                [field]: false,
                [photoField]: null,
                MissingValue: field === "Missing" ? "0.00" : r.MissingValue,
                ReplaceValue: field === "Damage" ? "0.00" : r.ReplaceValue,
              }
            : r
        )
      );
      return;
    }

    if (field === "Good") {
      setRows(prev =>
        prev.map(r => (r.id === rowId ? { ...r, Good: willBeOn, Refurbish: false, Missing: false, Damage: false, RefurbishValue: "0.00", MissingValue: "0.00", ReplaceValue: "0.00" } : r))
      );
      return;
    }
    if (field === "Refurbish") {
      const cost = willBeOn ? await getPartCost(partId, "Refurbish") : "0.00";
      setRows(prev =>
        prev.map(r => (r.id === rowId ? { ...r, Refurbish: willBeOn, RefurbishValue: cost, Good: false, Missing: false, Damage: false, MissingValue: "0.00", ReplaceValue: "0.00" } : r))
      );
      return;
    }
    if (field === "Missing" || field === "Damage") {
      const costField = field === "Missing" ? "MissingValue" : "ReplaceValue";
      const costType = field === "Missing" ? "Missing" : "Replace";
      const cost = willBeOn ? await getPartCost(partId, costType) : "0.00";
      setRows(prev =>
        prev.map(r => r.id === rowId ? { ...r, [costField]: cost, Good: false, Refurbish: false } : r)
      );
      if (willBeOn) openPhotoModal(rowId, field);
    }
  };

  const openPhotoModal = (rowId, photoType) => {
    setModalRowId(rowId);
    setModalPhotoType(photoType);
    setPhotoFile(null);

    setPhotoPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
    });

    setShowPhotoModal(true);
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setPhotoPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
    });

    setPhotoFile(file);
  };

  const handleCancelPhotoModal = () => {
    setPhotoPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
    });

    if (modalRowId != null && modalPhotoType) {
        setRows(prev =>
        prev.map(r => {
            if (r.id !== modalRowId) return r;
            return {
            ...r,
            [modalPhotoType]: false,
            MissingValue: modalPhotoType === "Missing" ? "0.00" : r.MissingValue,
            ReplaceValue: modalPhotoType === "Damage" ? "0.00" : r.ReplaceValue,
            MissingPhoto: modalPhotoType === "Missing" ? null : r.MissingPhoto,
            DamagePhoto: modalPhotoType === "Damage" ? null : r.DamagePhoto,
            };
        })
        );
    }

    setShowPhotoModal(false);
    setModalRowId(null);
    setModalPhotoType(null);
    setPhotoFile(null);
  };

  const handleSavePhotoModal = async () => {
    if (!photoFile || modalRowId == null || !modalPhotoType) {
        setError("Photo required.");
        return;
    }

    const row = rows.find(r => r.id === modalRowId);
    if (!row) {
        setError("Row not found.");
        return;
    }

    const uploadedPath = await uploadPhoto(photoFile, row.PartId, modalPhotoType);
    if (!uploadedPath) {
        setError("Upload failed.");
        return;
    }

    setRows(prev =>
        prev.map(r => {
        if (r.id !== modalRowId) return r;
        return {
            ...r,
            [modalPhotoType]: true,
            MissingPhoto: modalPhotoType === "Missing" ? uploadedPath : r.MissingPhoto,
            DamagePhoto: modalPhotoType === "Damage" ? uploadedPath : r.DamagePhoto,
        };
        })
    );

    setPhotoPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
    });
    setPhotoFile(null);
    setModalRowId(null);
    setModalPhotoType(null);
    setShowPhotoModal(false);
  };

  const handleSubmit = async () => {
    setError("");
    setInfo("");
    if (!userId || !locoNumber || !locoModel) {
      setError("Missing user/loco info.");
      return;
    }
    if (!rows || rows.length === 0) {
      setError("No rows to submit.");
      return;
    }
    const dtos = rows.map(r => ({
      UserId: userId,
      LocoNumber: locoNumber,
      LocoClass: locoClass ?? "",
      LocoModel: locoModel,
      FormId: effectiveFormId,
      PartId: r.PartId,
      PartDescr: r.PartDescr ?? "",
      GoodCheck: r.Good ? "Yes" : "No",
      RefurbishCheck: r.Refurbish ? "Yes" : "No",
      MissingCheck: r.Missing ? "Yes" : "No",
      DamageCheck: r.Damage ? "Yes" : "No",
      RefurbishValue: r.RefurbishValue ?? "0.00",
      MissingValue: r.MissingValue ?? "0.00",
      ReplaceValue: r.ReplaceValue ?? "0.00",
      DamagePhoto: r.DamagePhoto ?? null,
      MissingPhoto: r.MissingPhoto ?? null,
    }));
    setSubmitting(true);
    try {
      await axios.post("Inspection/SubmitInspection", dtos);
      setInfo("Inspection submitted successfully.");
    } catch (ex) {
      console.error(ex);
      setError("Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { field: "id", headerName: "No.", width: 80 },
    { field: "PartId", headerName: "Part ID", width: 120 },
    { field: "PartDescr", headerName: "Part Description", flex: 1, minWidth: 240 },
    {
      field: "Good",
      headerName: "Good",
      width: 120,
      renderHeader: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={selectAllGood}
            onChange={(e) => handleSelectAllGood(e.target.checked)}
            style={{ transform: "scale(1.4)", cursor: "pointer" }}
          />
          <span style={{ fontWeight: 600 }}>Good</span>
        </div>
      ),
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={!!params.row.Good}
          onChange={() => handleCheckboxChange(params.row.id, "Good")}
          style={{ transform: "scale(1.2)", cursor: "pointer" }}
        />
      ),
    },
    {
      field: "Refurbish",
      headerName: "Refurbish",
      width: 130,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={!!params.row.Refurbish}
          onChange={() => handleCheckboxChange(params.row.id, "Refurbish")}
          style={{ transform: "scale(1.2)", cursor: "pointer" }}
        />
      ),
    },
    {
      field: "Missing",
      headerName: "Missing",
      width: 130,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={!!params.row.Missing}
          onChange={() => handleCheckboxChange(params.row.id, "Missing")}
          style={{ transform: "scale(1.2)", cursor: "pointer" }}
        />
      ),
    },
    {
      field: "Damage",
      headerName: "Damage Replaced",
      width: 150,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={!!params.row.Damage}
          onChange={() => handleCheckboxChange(params.row.id, "Damage")}
          style={{ transform: "scale(1.2)", cursor: "pointer" }}
        />
      ),
    },
    {
      field: "RefurbishValue",
      headerName: "Refurbish Value",
      width: 150,
      renderCell: (params) => (
        <input
          className="form-control form-control-sm"
          value={params.row.RefurbishValue ?? "0.00"}
          disabled={!params.row.Refurbish}
          onChange={(e) =>
            setRows(prev =>
              prev.map(r => (r.id === params.row.id ? { ...r, RefurbishValue: e.target.value } : r))
            )
          }
        />
      ),
    },
    {
      field: "ReplaceValue",
      headerName: "Replace Value",
      width: 150,
      renderCell: (params) => (
        <input
          className="form-control form-control-sm"
          value={params.row.ReplaceValue ?? "0.00"}
          disabled={!params.row.Damage}
          onChange={(e) =>
            setRows(prev =>
              prev.map(r => (r.id === params.row.id ? { ...r, ReplaceValue: e.target.value } : r))
            )
          }
        />
      ),
    },
    {
      field: "Photo",
      headerName: "Photo",
      width: 160,
      renderCell: (params) => {
        const { text, url } = getPhotoDisplay(params.row);
        return url ? (
          <a href={url} target="_blank" rel="noreferrer">{text}</a>
        ) : (
          <span style={{ color: "#777", fontSize: 12 }}>{text}</span>
        );
      },
    },
  ];

  return (
    <Container fluid className="p-3" style={{ minHeight: "100vh" }}>
      <div style={{ marginBottom: 12 }}>
        <strong>Form:</strong> {String(effectiveFormId)} &nbsp;|&nbsp; <strong>Model:</strong> {locoModel} &nbsp;|&nbsp; <strong>Loco#:</strong> {locoNumber}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {info && <Alert variant="success">{info}</Alert>}

      {isMobile ? (
        <>
          <div style={{ background: "white", padding: 8, marginBottom: 12, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <input
              type="checkbox"
              checked={selectAllGood}
              onChange={(e) => handleSelectAllGood(e.target.checked)}
              style={{ width: 28, height: 28, marginRight: 8, cursor: "pointer" }}
            />
            <strong style={{ fontFamily: "Poppins, sans-serif" }}>Select All Good</strong>
          </div>

          {rows.map(r => (
            <Card key={r.id} className="mb-2 p-2" style={{ background: "#fafafa" }}>
              <div style={{ fontWeight: 600 }}>{r.PartDescr}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <label><input type="checkbox" checked={r.Good} onChange={() => handleCheckboxChange(r.id, "Good")} /> Good</label>
                <label><input type="checkbox" checked={r.Refurbish} onChange={() => handleCheckboxChange(r.id, "Refurbish")} /> Refurbish</label>
                <label><input type="checkbox" checked={r.Missing} onChange={() => handleCheckboxChange(r.id, "Missing")} /> Missing</label>
                <label><input type="checkbox" checked={r.Damage} onChange={() => handleCheckboxChange(r.id, "Damage")} /> Damage</label>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <input
                  className="form-control form-control-sm"
                  value={r.RefurbishValue}
                  disabled={!r.Refurbish}
                  onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, RefurbishValue: e.target.value } : x))}
                  placeholder="Refurbish Value"
                />
                <input
                  className="form-control form-control-sm"
                  value={r.ReplaceValue}
                  disabled={!r.Damage}
                  onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, ReplaceValue: e.target.value } : x))}
                  placeholder="Replace Value"
                />
                <a
                  href={r.MissingPhoto || r.DamagePhoto || "#"}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: (r.MissingPhoto || r.DamagePhoto) ? "blue" : "#777" }}
                >
                  {r.MissingPhoto ? "Missing Photo saved" : r.DamagePhoto ? "Damage Photo saved" : "No Photo"}
                </a>
              </div>
            </Card>
          ))}
        </>
      ) : (
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={r => r.id}
            pageSize={10}
            disableSelectionOnClick
            loading={loading}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Inspection"}</Button>
      </div>

      <Modal show={showPhotoModal} onHide={handleCancelPhotoModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalPhotoType === "Missing" ? "Missing Photo" : "Damage Photo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="photoFile">
            <Form.Label>Capture or upload photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoFileChange}
            />
          </Form.Group>
          {photoPreview && (
            <div className="text-center mt-3">
              <Image src={photoPreview} alt="Preview" thumbnail style={{ maxWidth: "100%" }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelPhotoModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePhotoModal}>Save Photo</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InspectionProcess;
