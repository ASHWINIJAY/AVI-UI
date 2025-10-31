import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Modal, Spinner } from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../../api/axios";

const GE35DE001Inspect = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const storedLocoNumber = localStorage.getItem("locoNumber") ?? "";
    const storedLocoClass = localStorage.getItem("locoClass") ?? "";
    const storedLocoModel = localStorage.getItem("locoModel") ?? "";
    const [formID] = useState("DE001");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectAllGood, setSelectAllGood] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [modalRowId, setModalRowId] = useState(null);
    const [modalPhotoType, setModalPhotoType] = useState(null);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [showValidationModal, setShowValidationModal] = useState(false);

    const [showConfirmBackModal, setShowConfirmBackModal] = useState(false);

    useEffect(() => {
        const fetchParts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`GE35DE001/getParts/${formID}?t=${Date.now()}`);
                const data = Array.isArray(res.data) ? res.data : [];
                const prepared = data
                    .map((p, idx) => ({
                        id: idx + 1,
                        PartId: (p.PartID ?? p.partID ?? "").toString(),
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
                        const numA = parseInt((a.PartId.match(/\d+/) || ["0"])[0], 10) || 0;
                        const numB = parseInt((b.PartId.match(/\d+/) || ["0"])[0], 10) || 0;
                        if (numA === numB) return a.PartId.localeCompare(b.PartId);
                        return numA - numB;
                    });
                setRows(prepared);
                setSelectAllGood(false);
            } catch (ex) {
                console.error("GetParts error", ex);
                setError("Failed to load parts.");
            } finally {
                setLoading(false);
            }
        };
        fetchParts();
    }, [formID]);

    useEffect(() => {
        setSelectAllGood(rows.length > 0 && rows.every((r) => r.Good));
    }, [rows]);

    useEffect(() => {
        return () => {
            if (photoPreview) {
                try { URL.revokeObjectURL(photoPreview); } catch { /* ignore */ }
            }
        };
    }, [photoPreview]);

    const getPartCost = async (partId, field) => {
        try {
            const res = await axios.get(
                `GE35DE001/getPartCost?partId=${encodeURIComponent(partId)}&field=${encodeURIComponent(field)}`
            );
            if (!res || res.status !== 200) return "0.00";
            // Ensure we return a string
            if (res.data == null) return "0.00";
            if (typeof res.data === "string") return res.data;
            if (typeof res.data === "number") return res.data.toFixed(2);
            if (res.data.value) return res.data.value.toString();
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
            fd.append("formId", formID);
            fd.append("partId", partId);
            fd.append("photoType", photoType);
            fd.append("locoNumber", storedLocoNumber);
            fd.append("locoModel", storedLocoModel);

            const res = await axios.post("GE35DE001/UploadPhoto", fd, {
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
            await axios.post("GE35DE001/DeletePhoto", { path: photoPath });
        } catch (ex) {
            console.warn("DeletePhoto failed", ex);
        }
    };

    const handleCheckboxChange = async (rowId, field) => {
        setError("");
        const current = rows.find(r => r.id === rowId);
        if (!current) return;

        const willBeOn = !current[field];

        // Always reset all checkboxes and their values/photos
        let updatedRow = {
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

        // Remove photo if previously set
        if (current.MissingPhoto) await deletePhoto(current.MissingPhoto);
        if (current.DamagePhoto) await deletePhoto(current.DamagePhoto);

        if (!willBeOn) {
            // If unchecking the same box, leave all reset
            setRows(prev => prev.map(r => r.id === rowId ? updatedRow : r));
            return;
        }

        // Activate the selected checkbox and fetch value if needed
        if (field === "Good") {
            updatedRow.Good = true;
        } else if (field === "Refurbish") {
            updatedRow.Refurbish = true;
            updatedRow.RefurbishValue = await getPartCost(current.PartId, "Refurbish");
        } else if (field === "Missing") {
            updatedRow.Missing = true;
            updatedRow.MissingValue = await getPartCost(current.PartId, "Missing");
            openPhotoModal(rowId, "Missing");
        } else if (field === "Damage") {
            updatedRow.Damage = true;
            updatedRow.ReplaceValue = await getPartCost(current.PartId, "Replace");
            openPhotoModal(rowId, "Damage");
        }

        setRows(prev => prev.map(r => r.id === rowId ? updatedRow : r));
    };



    const handleSelectAllGood = (checked) => {
        setSelectAllGood(checked);
        setRows((prev) => prev.map((r) => ({ ...r, Good: checked, Refurbish: false, Missing: false, Damage: false, RefurbishValue: "0.00", MissingValue: "0.00", ReplaceValue: "0.00" })));
    };

    const openPhotoModal = (rowId, photoType) => {
        setModalRowId(rowId);
        setModalPhotoType(photoType);
        setPhotoFile(null);

        try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch { /* ignore */ }
        setPhotoPreview(null);
        setShowPhotoModal(true);
    };

    const handlePhotoFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch { /* ignore */ }
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoFile(file);
    };

    const handleCancelPhotoModal = () => {
        try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch { /* ignore */ }
        setPhotoPreview(null);

        if (modalRowId != null && modalPhotoType) {
            setRows((prev) => prev.map((r) => {
                if (r.id !== modalRowId) return r;
                const base = { ...r, [modalPhotoType]: false };
                if (modalPhotoType === "Missing") base.MissingValue = "0.00";
                if (modalPhotoType === "Damage") base.ReplaceValue = "0.00";
                if (modalPhotoType === "Missing") base.MissingPhoto = null;
                if (modalPhotoType === "Damage") base.DamagePhoto = null;
                return base;
            }));
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
        const row = rows.find((r) => r.id === modalRowId);
        if (!row) { setError("Row not found."); return; }

        const uploadedPath = await uploadPhoto(photoFile, row.PartId, modalPhotoType);
        if (!uploadedPath) { setError("Upload failed."); return; }

        setRows((prev) => prev.map((r) => {
            if (r.id !== modalRowId) return r;
            const update = { ...r, [modalPhotoType]: true };
            if (modalPhotoType === "Missing") update.MissingPhoto = uploadedPath;
            if (modalPhotoType === "Damage") update.DamagePhoto = uploadedPath;
            return update;
        }));

        try { if (photoPreview) URL.revokeObjectURL(photoPreview); } catch { /* ignore */ }
        setPhotoPreview(null);
        setPhotoFile(null);
        setModalRowId(null);
        setModalPhotoType(null);
        setShowPhotoModal(false);
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        setInfo("");

        const invalidRow = rows.find(r => !r.Good && !r.Refurbish && !r.Missing && !r.Damage);
        if (invalidRow) {
            setShowValidationModal(true);
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
            const dtos = rows.map((r) => ({
                LocoNumber: parseInt(storedLocoNumber),
                LocoModel: storedLocoModel ?? "",
                LocoClass: storedLocoClass ?? "",
                FormID: formID,
                PartID: r.PartId,
                PartDescr: r.PartDescr ?? "",
                GoodCheck: r.Good ? "Yes" : "No",
                RefurbishCheck: r.Refurbish ? "Yes" : "No",
                MissingCheck: r.Missing ? "Yes" : "No",
                DamageCheck: r.Damage ? "Yes" : "No",
                RefurbishValue: r.RefurbishValue ?? "0.00",
                MissingValue: r.MissingValue ?? "0.00",
                ReplaceValue: r.ReplaceValue ?? "0.00",
                MissingPhoto: r.MissingPhoto ?? "No Photo",
                DamagePhoto: r.DamagePhoto ?? "No Photo",
            }));
            await axios.post("GE35DE001/SubmitInspection", dtos,
                { headers: { "Content-Type": "application/json" } }
            );
            setInfo("Inspection submitted successfully.");
            navigate("/GE35RF001")
        } catch (ex) {
            console.error(ex);
            setError("Submit failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackClick = () => {
        setShowConfirmBackModal(true);
    };

    const confirmGoBack = async () => {
        // Delete all uploaded photos
        for (const r of rows) {
            if (r.MissingPhoto) await deletePhoto(r.MissingPhoto);
            if (r.DamagePhoto) await deletePhoto(r.DamagePhoto);
        }

        // Reset everything
        setRows((prev) =>
            prev.map((r) => ({
                ...r,
                Good: false,
                Refurbish: false,
                Missing: false,
                Damage: false,
                RefurbishValue: "0.00",
                MissingValue: "0.00",
                ReplaceValue: "0.00",
                MissingPhoto: null,
                DamagePhoto: null,
            }))
        );
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowConfirmBackModal(false);

        navigate(-1);
    };

    const columns = [
        { field: "id", headerName: "No.", width: 80 },
        { field: "PartId", headerName: "Part ID", width: 120 },
        { field: "PartDescr", headerName: "Description", flex: 1, minWidth: 220 },
        {
            field: "Good",
            headerName: "Good",
            width: 110,
            renderHeader: () => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        {
            field: "RefurbishValue",
            headerName: "Refurbish Value",
            width: 140,
            hidden: true,
            renderCell: (params) => (
                <input className="form-control form-control-sm" readOnly value={params.row.RefurbishValue} />
            )
        },
        {
            field: "MissingValue",
            headerName: "Missing Value",
            width: 140,
            renderCell: (params) => (
                <input className="form-control form-control-sm" readOnly value={params.row.MissingValue} />
            )
        },
        {
            field: "ReplaceValue",
            headerName: "Replace Value",
            width: 140,
            renderCell: (params) => (
                <input className="form-control form-control-sm" readOnly value={params.row.ReplaceValue} />
            )
        }
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Container className="mt-4 mb-4">
                <h3 className="text-center mb-4" style={{ color: "white" }}>End Deck Inspect</h3>
                {info && <div style={{ color: "green", backgroundColor: "white", marginBottom: 8 }}>{info}</div>}

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><Spinner animation="border" /></div>
                ) : isMobile ? (
                    <div>
                        <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 8, color: "white" }}>
                            <input type="checkbox" checked={selectAllGood} onChange={(e) => handleSelectAllGood(e.target.checked)} />
                            <strong>Select All Good</strong>
                        </div>

                        {rows.map((row) => (
                            <div key={row.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12, background: "#fff" }}>
                                <div style={{ marginBottom: 6 }}><strong>{row.PartId}</strong> {row.PartDescr}</div>

                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <label style={{ cursor: "pointer" }}>
                                        <input type="checkbox" checked={row.Good} onChange={() => handleCheckboxChange(row.id, "Good")} /> Good
                                    </label>

                                    <label style={{ cursor: "pointer" }}>
                                        <input type="checkbox" checked={row.Refurbish} onChange={() => handleCheckboxChange(row.id, "Refurbish")} /> Refurbish
                                    </label>

                                    <label style={{ cursor: "pointer" }}>
                                        <input type="checkbox" checked={row.Missing} onChange={() => handleCheckboxChange(row.id, "Missing")} /> Missing
                                    </label>

                                    <label style={{ cursor: "pointer" }}>
                                        <input type="checkbox" checked={row.Damage} onChange={() => handleCheckboxChange(row.id, "Damage")} /> Damage
                                    </label>
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <input className="form-control form-control-sm" readOnly value={row.RefurbishValue} placeholder="Refurbish Value" />
                                    <input className="form-control form-control-sm mt-1" readOnly value={row.MissingValue} placeholder="Missing Value" />
                                    <input className="form-control form-control-sm mt-1" readOnly value={row.ReplaceValue} placeholder="Replace Value" />
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    {row.MissingPhoto ? <div style={{ fontSize: 12, color: "#007bff" }}>Missing photo saved</div> : null}
                                    {row.DamagePhoto ? <div style={{ fontSize: 12, color: "#007bff" }}>Damage photo saved</div> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ height: 580, width: "100%", background: "#fff", borderRadius: 8, padding: 8 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            initialState={{
                                columns: {
                                    columnVisibilityModel: {
                                        RefurbishValue: true,
                                        MissingValue: true,
                                        ReplaceValue: true// hide it on load
                                    },
                                },
                            }}
                            disableRowSelectionOnClick
                        />
                    </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                    <Button variant="secondary" onClick={handleBackClick}>Back</Button>
                    <Button variant="success" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Continue"}</Button>
                </div>
            </Container>

            {/* Photo modal */}
            <Modal show={showPhotoModal} onHide={handleCancelPhotoModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Photo ({modalPhotoType ?? ""})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error === "Photo required." && <div style={{ color: "red", marginBottom: 8 }}>Photo required</div>}
                    <input
                        key={modalRowId + "_" + (modalPhotoType ?? "")}
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

            <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Validation Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Each row must have at least one checkbox selected before continuing.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowValidationModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmBackModal} onHide={() => setShowConfirmBackModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Navigation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to go back? <br />
                    <strong>All entered data and photos will be lost.</strong>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmBackModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmGoBack}>
                        Yes, Go Back
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GE35DE001Inspect;
