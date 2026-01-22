import React, { useEffect, useState, useRef } from "react";
import { Container, Card, Spinner, Button, Modal, Row, Col, Form } from "react-bootstrap";
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from "react-router-dom";
import axios from "axios";

//const API = "https://localhost:7066";
const API = "http://41.87.206.94/AVIapi";
function AssetTypeSetup() {
    const locoType = [
        "18E",
        "D34",
        "D35",
        "D36"
    ]

    const wagonType = [
        "AKJ1",
        "AKLJ1",
        "AKLJ2",
        "AY10",
        "AY11",
        "AY12",
        "AY13",
        "AY5",
        "AY6",
        "AY7",
        "AY9",
        "AYJ14",
        "AYLJ10",
        "AYLJ11",
        "AYLJ14",
        "AYLJ7",
        "AYLJ8",
        "AYLJ9",
        "AZD4",
        "AZD5",
        "AZD6",
        "AZJ4",
        "AZJ5",
        "AZJ6",
        "AZLJ4",
        "AZLJ5",
        "AZLJ6",
        "AZLJ8",
        "CAJ1",
        "CAJ2",
        "CAJ6",
        "CAJ7",
        "CAL6",
        "CALJ5",
        "CALJ6",
        "CSJ1",
        "CSJ2",
        "CSMJ2",
        "CSMJ3",
        "CSR5",
        "CSR6",
        "CSRJ4",
        "DAJ4",
        "DAJ5",
        "DAJ6",
        "DAZ6",
        "DBL1",
        "DBL2",
        "DGL2",
        "DGLJ1",
        "DGLJ3",
        "DJ1",
        "DJ2",
        "DJM4",
        "DJML4",
        "DKJ2",
        "DKJ3",
        "DKL2",
        "DKL3",
        "DKZ9",
        "DLJ1",
        "DLJ2",
        "DPP1",
        "DPP2",
        "DZ12",
        "DZ7",
        "DZ9",
        "DZA8",
        "DZA9",
        "DZJ7",
        "DZJ8",
        "DZJ9",
        "DZS7",
        "FCD2",
        "FCJ2",
        "FCLJ2",
        "FCMJ2",
        "FFLJ1",
        "FGJ1",
        "FGJ2",
        "FGL3",
        "FGL4",
        "FGLJ1",
        "FGLJ2",
        "FKD1",
        "FKD3",
        "FKJ1",
        "FKJ10",
        "FKJ3",
        "FKLJ1",
        "FKLJ3",
        "FKMJ1",
        "FKMJ3",
        "FKMLJ1",
        "FKMLJ3",
        "FP2",
        "FP5",
        "FPJ9",
        "FSLJ2",
        "FSLJ3",
        "FSLJ4",
        "FZJ7",
        "FZJ8",
        "FZJ9",
        "FZL1",
        "FZLJ7",
        "FZLJ8",
        "FZLJ9",
        "NAY10",
        "NAY11",
        "NAY12",
        "NAY5",
        "NAY6",
        "NAY7",
        "NAY8",
        "NAY9",
        "NDJ1",
        "NDLJ1",
        "NDLJ2",
        "NDLJ3",
        "NDLJ4",
        "NDLJ5",
        "NDLJ6",
        "NDLJ7",
        "NDZLJ1",
        "NDZLJ2",
        "NDZLJ4",
        "NPS1",
        "NPS2",
        "NPS3",
        "NPS4",
        "NPS5",
        "NSBLJ7",
        "O1",
        "O3",
        "O4",
        "O6",
        "O7",
        "O8",
        "O9",
        "OA1",
        "OLJ5",
        "OLJ6",
        "OLJ7",
        "OLJ8",
        "QB1",
        "QCJ1",
        "QCLJ1",
        "S4",
        "SBJ10",
        "SBJ3",
        "SBLJ2",
        "SBLJ6",
        "SBLJ7",
        "SCL10",
        "SCL11",
        "SCL13",
        "SCL15",
        "SCL18",
        "SCL19",
        "SCL20",
        "SCL21",
        "SCL8",
        "SCL9",
        "SCLV10",
        "SCLV13",
        "SCML16",
        "SCML17",
        "SCML22",
        "SCML23",
        "SCML24",
        "SCPL2",
        "SFJ1",
        "SFJ2",
        "SHJ4",
        "SHL5",
        "SHL6",
        "SHLJ10",
        "SHLJ11",
        "SHLJ12",
        "SHLJ13",
        "SHLJ14",
        "SHLJ15",
        "SHLJG1",
        "SHR12",
        "SHR14",
        "SHR27",
        "SHR28",
        "SHR29",
        "SHRJ29",
        "SKL4",
        "SLJ18",
        "SML13",
        "SMLJ1",
        "SMLJ10",
        "SMLJ11",
        "SMLJ12",
        "SMLJ14",
        "SMLJ15",
        "SMLJ16",
        "SMLJ17",
        "SMLJ18",
        "SMLJ19",
        "SMLJ2",
        "SMLJ20",
        "SMLJ22",
        "SMLJ23",
        "SMLJ24",
        "SMLJ3",
        "SMLJ4",
        "SMLJ6",
        "SMLJ7",
        "SMLJ8",
        "SMLJ9",
        "SMLJG1",
        "SMR20",
        "SMR22",
        "SMR24",
        "SMR27",
        "SMR5",
        "SMR6",
        "SPPJ1",
        "SSJ7",
        "SSLJ3",
        "SSLJ4",
        "SSLJ5",
        "SSLJ6",
        "SSLJ8",
        "ST5",
        "STJ12",
        "STJ13",
        "STJ15",
        "STJ2",
        "STJ3",
        "STJ4",
        "STJ5",
        "STL13",
        "STL14",
        "STL15",
        "STL8",
        "STLJ10",
        "STLJ11",
        "STLJ14",
        "STLJ17",
        "STLJ3",
        "STLJ6",
        "STLJ8",
        "STMLJ1",
        "SWLJ19",
        "SWR10",
        "SWR11",
        "SWR18",
        "SWR19",
        "SWR3",
        "SWR8",
        "SWR9",
        "UNK",
        "VLJ13",
        "VLJ14",
        "X17",
        "X25",
        "X3",
        "XB10",
        "XB8",
        "XBJ10",
        "XBJ11",
        "XBJ5",
        "XBJ7",
        "XBJ8",
        "XBJ9",
        "XBL11",
        "XBL12",
        "XBL13",
        "XBL14",
        "XBLJ10",
        "XBLJ11",
        "XBLJ12",
        "XBLJ13",
        "XBLJ14",
        "XBLJ5",
        "XBLJ8",
        "XBLJ9",
        "XFBLJ7",
        "XFL5",
        "XFLJ11",
        "XFLJ2",
        "XFLJ4",
        "XFLJ5",
        "XFLJ6",
        "XFLJ9",
        "XH1",
        "XH2",
        "XJ1",
        "XJ18",
        "XJ2",
        "XJ21",
        "XJ24",
        "XJ25",
        "XJ3",
        "XLJ1",
        "XLJ2",
        "XLJ3",
        "XMJ12",
        "XMJ14",
        "XMLJ14",
        "XMLJ7",
        "XMLJ9",
        "XN2",
        "XNJ1",
        "XNJ2",
        "XNJ3",
        "XNJ4",
        "XNJ5",
        "XNJ6",
        "XNJ7",
        "XNLJ2",
        "XNLJ3",
        "XNLJ4",
        "XNLJ5",
        "XNLJ6",
        "XNLJ7",
        "XNLJ8",
        "XNLJ9",
        "XOJ3",
        "XOJ5",
        "XOLJ3",
        "XP10",
        "XP16",
        "XP17",
        "XP18",
        "XP6",
        "XP7",
        "XPD14",
        "XPD15",
        "XPJ10",
        "XPJ11",
        "XPJ12",
        "XPJ13",
        "XPJ14",
        "XPJ15",
        "XPJ16",
        "XPJ17",
        "XPJ18",
        "XPJ19",
        "XPJ20",
        "XPJ21",
        "XPJ7",
        "XPJ8",
        "XPJ9",
        "XPLJ13",
        "XPLJ16",
        "XPLJ17",
        "XPLJ18",
        "XPLJ19",
        "XPLJ21",
        "XPLJ22",
        "XPRJ23",
        "XQJ4",
        "XQJ5",
        "XQJ6",
        "XQLJ1",
        "XQLJ2",
        "XQLJ3",
        "XSJ10",
        "XSJ11",
        "XSJ12",
        "XSJ13",
        "XSJ8",
        "XSJ9",
        "XSLJ14",
        "XSLJ15",
        "XVJ1",
        "XVJ11",
        "XVJ12",
        "XVJ2",
        "XVJ3",
        "XVJ4",
        "XVJ5",
        "XVJ6",
        "XVJ7",
        "XVJ8",
        "XVJ9",
        "XVLJ8",
        "XVLJ9",
        "XWJ2",
        "XWLJ9",
        "XX1",
        "XXGLJ1",
        "XXJ1",
        "XXJ4",
        "XXJ5",
        "XYJ1",
        "XZJ4",
        "XZJ5",
        "XZJ6",
        "XZJ7",
        "XZLJ5",
        "XZLJ6",
        "XZLJ7"
    ] 

    const optionList = [
        "Locomotive",
        "Wagon"
    ]

    const [formData, setFormData] = useState({
        TypeAsset: "",
        LocoType: "",
        WagonType: "",
        RefurbishmentCost: "",
        LeaseIncome: "",
        UserId: "",
    });
        
    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleBack = async () => {
        navigate("/master/adminoptions");
    };

    const handleAssetChange = async (e) => {
        setLoading(true);

        const typeAsset = e.value;

        setFormData((prev) => ({
            ...prev,
            TypeAsset: typeAsset,
            LocoType: "",
            WagonType: "",
            RefurbishmentCost: "",
            LeaseIncome: "",
        }));

        setLoading(false);
    };

    const handleLocoChange = async (e) => {

        setLoading(true);

        const assetType = e.value;

        setFormData((prev) => ({
            ...prev,
            LocoType: assetType,
        }));

        try {
            const res = await axios.get(`${API}/api/DCF/getInfoAsset/${assetType}`);

            setFormData(prev => ({
                ...prev,
                RefurbishmentCost: res.data.refurbishmentCost || "",
                LeaseIncome: res.data.leaseIncome || "",
            }));
        }
        catch (err) {
            console.error("Auto-populate error:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleWagonChange = async (e) => {

        setLoading(true);

        const assetType = e.value;

        setFormData((prev) => ({
            ...prev,
            WagonType: assetType,
        }));

        try {
            const res = await axios.get(`${API}/api/DCF/getInfoAsset/${assetType}`);

            setFormData(prev => ({
                ...prev,
                RefurbishmentCost: res.data.refurbishmentCost || "",
                LeaseIncome: res.data.leaseIncome || "",
            }));
        }
        catch (err) {
            console.error("Auto-populate error:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const preventInvalidBeforeInput = (e, currentValue) => {

        const data = e.nativeEvent && e.nativeEvent.data;
        if (!data) {
            return;
        }

        if (/^[0-9]$/.test(data)) return;

        if (data === "." && !currentValue.includes(".")) return;

        e.preventDefault();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Called on paste to block invalid pasted content
    const preventInvalidPaste = (e, currentValue) => {
        const paste = (e.clipboardData || window.clipboardData).getData("text");
        if (!paste) {
            e.preventDefault();
            return;
        }

        // Reject if contains any character other than digits or dot
        if (!/^[0-9.]+$/.test(paste)) {
            e.preventDefault();
            return;
        }

        // Reject if more than one dot in pasted content
        const pasteDots = (paste.match(/\./g) || []).length;
        if (pasteDots > 1) {
            e.preventDefault();
            return;
        }

        // Reject if current value already has a dot and paste contains a dot
        if (currentValue.includes(".") && paste.includes(".")) {
            e.preventDefault();
            return;
        }
    };

    // Called on drop to block invalid dropped content
    const preventInvalidDrop = (e, currentValue) => {
        const text = e.dataTransfer && e.dataTransfer.getData("text");
        if (!text) {
            e.preventDefault();
            return;
        }

        if (!/^[0-9.]+$/.test(text)) {
            e.preventDefault();
            return;
        }

        const textDots = (text.match(/\./g) || []).length;
        if (textDots > 1) {
            e.preventDefault();
            return;
        }

        if (currentValue.includes(".") && text.includes(".")) {
            e.preventDefault();
            return;
        }
    };

    const validateBeforeSubmit = () => {
        const errors = [];

        if (!formData.RefurbishmentCost) {
            errors.push("Refurbishment Cost is required.")
        }

        if (!formData.LeaseIncome) {
            errors.push("Lease Income/Revenue is required.");
        }

        return errors;
    };

    const handleSave = async () => {
        setShowConfirm(false);

        const errors = validateBeforeSubmit();

        if (errors.length > 0) {
            setErrorMessages(errors);
            setShowError(true);
            return;
        }

        setLoading(true);

        const data = new FormData();

        formData.UserId = localStorage.getItem("userId");

        if (formData.TypeAsset === "Locomotive") {
            data.append("AssetType", formData.LocoType);
        }
        else if (formData.TypeAsset === "Wagon") {
            data.append("AssetType", formData.WagonType);
        }
        data.append("RefurbishmentCost", formData.RefurbishmentCost);
        data.append("LeaseIncome", formData.LeaseIncome);
        data.append("UserId", formData.UserId);

        try {
            await axios.post(`${API}/api/DCF/insertUpdateAsset`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setShowSuccess(true);

            setFormData((prev) => ({
                ...prev,
                TypeAsset: "",
                LocoType: "",
                WagonType: "",
                RefurbishmentCost: "",
                LeaseIncome: "",
                UserId: "",
            }));
        }
        catch (err) {
            console.error(err);
            setErrorMessages(["Error saving/updating Asset setup. See console for details."]);
            setShowError(true);
        }
        finally {
            setLoading(false);
        }

    }

    const handleSuccessClose = () => {
        setShowSuccess(false);
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
                                Asset Type Setup
                            </h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type of Asset</Form.Label>
                                    <Dropdown name="TypeAsset" value={formData.TypeAsset} onChange={handleAssetChange} options={optionList}
                                        placeholder="Select Type of Asset" style={{ width: "100%" }} />
                                </Form.Group>
                                {(formData.TypeAsset !== "" && formData.TypeAsset === "Locomotive") && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Asset Type</Form.Label>
                                        <Dropdown name="LocoType" value={formData.LocoType} onChange={handleLocoChange} options={locoType}
                                            filter placeholder="Select Type" style={{ width: "100%" }}/>
                                    </Form.Group>
                                )}
                                {(formData.TypeAsset !== "" && formData.TypeAsset === "Wagon") && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Asset Type</Form.Label>
                                        <Dropdown name="WagonType" value={formData.WagonType} onChange={handleWagonChange} options={wagonType}
                                            filter placeholder="Select Type" style={{ width: "100%" }} />
                                    </Form.Group>
                                )}
                                {(formData.LocoType !== "" || formData.WagonType !== "") && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Refurbishment Cost (ZAR)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="RefurbishmentCost"
                                                value={formData.RefurbishmentCost}
                                                placeholder="Enter Refurbishment Cost"
                                                autoComplete="off"
                                                inputMode="decimal"
                                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.ScrappingCost)}
                                                onPaste={(e) => preventInvalidPaste(e, formData.ScrappingCost)}
                                                onDrop={(e) => {
                                                    preventInvalidDrop(e, formData.ScrappingCost);
                                                }}
                                                onChange={handleChange}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Lease Income/Revenue (ZAR)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="LeaseIncome"
                                                value={formData.LeaseIncome}
                                                placeholder="Enter Lease Income/Revenue"
                                                autoComplete="off"
                                                inputMode="decimal"
                                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.ScrappingCost)}
                                                onPaste={(e) => preventInvalidPaste(e, formData.ScrappingCost)}
                                                onDrop={(e) => {
                                                    preventInvalidDrop(e, formData.ScrappingCost);
                                                }}
                                                onChange={handleChange}
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </>
                                )}
                                <Row className="mt-4">
                                    <Col>
                                        <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
                                    </Col>
                                    {(formData.TypeAsset !== "" && (formData.LocoType !== "" || formData.WagonType !== "")) && (
                                        <Col className="text-end">
                                            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading.." : "Save"}</Button>
                                        </Col>
                                    )}
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={showConfirm} onHide={() => !loading && setShowConfirm(false)}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>Confirm Save</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to save the setup for this asset type?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>No</Button>
                    <Button variant="primary" onClick={handleSave} disabled={loading}>{loading ? "Loading..." : "Yes"}</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showConfirmBack} onHide={() => !loading && setShowConfirmBack(false)}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>Confirm Back</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to go back?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmBack(false)} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleBack} disabled={loading}>Confirm</Button>
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
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>Input has been saved/updated successfully.</Modal.Body>
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
        </Container>
    )
}

export default AssetTypeSetup;