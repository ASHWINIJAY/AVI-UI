import React, { useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Spinner, Card } from "react-bootstrap";
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from "react-router-dom";
//import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const API = "http://41.87.206.94/AVIapi";

function GenerateDCFConsolidated() {
    const [assetList, setAssetList] = useState([]);

    const optionList = [
        "Generate For All Asset Types",
        "Generate For Single Asset Type",
    ]

    const [formData, setFormData] = useState({
        AssetTypeOption: "",
        AssetType: "",
    });

    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showConfirm2, setShowConfirm2] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async (type) => {
        setLoading(true);
        try {
            if (type === "Generate For Single Asset Type") {
                let res;
                res = await fetch(`${API}/api/DCFCon/getAssetType`);
                const data = await res.json();
                setAssetList(data || []);
            }
        }
        catch (err) {
            console.error("Error fetching data:", err);
            setAssetList([]);
        }
        finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        localStorage.removeItem("assetType");
        navigate("/adminoptions");
    };

    const handleTypeChange = async (e) => {
        setLoading(true);

        const assetTypeOption = e.value;

        setFormData((prev) => ({
            ...prev,
            AssetTypeOption: assetTypeOption,
        }));

        try {
            await fetchData(assetTypeOption);
        }
        catch (err) {
            console.error("Data collection error:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleAssetTypeChange = async (e) => {
        const assetType = e.value;
        setFormData((prev) => ({
            ...prev,
            AssetType: assetType,
        }));
    };

    const validateBeforeSubmit = () => {
        const errors = [];

        if (formData.AssetTypeOption === "Generate For Single Asset Type") {
            if (!formData.AssetType) {
                errors.push("Asset Type is required.")
            }
        }

        return errors;
    };

    const handleGenerate = async () => {
        setShowConfirm(false);
        setShowConfirm2(false);

        const errors = validateBeforeSubmit();

        if (errors.length > 0) {
            setErrorMessages(errors);
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            if (formData.AssetTypeOption === "Generate For Single Asset Type") {
                const assetType = formData.AssetType;
                localStorage.setItem("assetType", assetType);
                navigate("/master/dcfconreportsingle");
            }
            else if (formData.AssetTypeOption === "Generate For All Asset Types") {
                navigate("/master/dcfconreportall");
            }
        }
        catch (err) {
            console.error("Generate navigation error:", err);
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
                                Generate DCF Consolidated Report
                            </h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Option</Form.Label>
                                    <Dropdown name="AssetTypeOption" value={formData.AssetTypeOption} onChange={handleTypeChange} options={optionList}
                                        placeholder="Select Option" style={{ width: "100%" }} />
                                </Form.Group>
                                {(formData.AssetTypeOption !== "" && formData.AssetTypeOption === "Generate For Single Asset Type") && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Asset Type</Form.Label>
                                        <Dropdown name="AssetType" value={formData.AssetType} onChange={handleAssetTypeChange} options={assetList} optionLabel="assetType"
                                            optionValue="assetType" filter placeholder="Select Asset Type" style={{ width: "100%" }} />
                                    </Form.Group>
                                )}
                                <Row className="mt-4">
                                    <Col>
                                        <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
                                    </Col>
                                    {formData.AssetTypeOption === "Generate For Single Asset Type" && (
                                        <Col className="text-end">
                                            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading.." : "Generate"}</Button>
                                        </Col>
                                    )}
                                    {formData.AssetTypeOption === "Generate For All Asset Types" && (
                                        <Col className="text-end">
                                            <Button variant="primary" onClick={() => setShowConfirm2(true)} disabled={loading}>{loading ? "Loading.." : "Generate"}</Button>
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
                    <Modal.Title>Confirm Single Generate</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to generate a DCF consolidated report for this asset type?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>No</Button>
                    <Button variant="primary" onClick={handleGenerate} disabled={loading}>{loading ? "Loading..." : "Yes"}</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showConfirm2} onHide={() => !loading && setShowConfirm2(false)}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>Confirm All Generate</Modal.Title>
                </Modal.Header>
                <Modal.Body>Warning: this process may take a while (5 minutes). Do you want to generate DCF consolidated reports for all asset types?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm2(false)} disabled={loading}>No</Button>
                    <Button variant="primary" onClick={handleGenerate} disabled={loading}>{loading ? "Loading..." : "Yes"}</Button>
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
            {loading && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
                    <Spinner animation="border" variant="light" style={{ width: "4rem", height: "4rem" }} />
                </div>
            )}
        </Container>
    );

}

export default GenerateDCFConsolidated;