import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Spinner, Card } from "react-bootstrap";
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const API = "http://41.87.206.94/AVIapi";

function GenerateDCFReport() {
    const [wagonList, setWagonList] = useState([]);
    const [locoList, setLocoList] = useState([]);

    const optionList = [
        "Locomotive",
        "Wagon",
    ]

    const [formData, setFormData] = useState({
        GenerateType: "",
        WagonNumber: "",
        LocoNumber: "",
    });

    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async (type) => {
        setLoading(true);
        try {
            if (type === "Wagon") {
                let res;
                res = await fetch(`${API}/api/DCF/getInputWagons`);
                const data = await res.json();
                setWagonList(data || []);
            }
            else if (type === "Locomotive") {
                let res;
                res = await fetch(`${API}/api/DCF/getInputLocos`);
                const data = await res.json();
                setLocoList(data || []);
            }
        }
        catch (err) {
            console.error("Error fetching data:", err);
            setWagonList([]);
            setLocoList([]);
        }
        finally {
            setLoading(false);
        }
    };

    const handleBack = async () => {
        localStorage.removeItem("locoNumber");
        localStorage.removeItem("wagonNumber");
        navigate("/master/adminoptions");
    };

    const handleTypeChange = async (e) => {
        setLoading(true);

        const generateType = e.value;

        setFormData((prev) => ({
            ...prev,
            GenerateType: generateType,
        }));

        try {
            await fetchData(generateType);
        }
        catch (err) {
            console.error("Data collection error:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleLocoChange = async (e) => {
        const locoNumber = e.value;
        setFormData((prev) => ({
            ...prev,
            LocoNumber: locoNumber,
        }));
    };

    const handleWagonChange = async (e) => {
        const wagonNumber = e.value;
        setFormData((prev) => ({
            ...prev,
            WagonNumber: wagonNumber,
        }));
    };

    const validateBeforeSubmit = () => {
        const errors = [];

        if (formData.GenerateType === "Locomotive") {
            if (!formData.LocoNumber) {
                errors.push("Asset number is required.")
            }
        }

        if (formData.GenerateType === "Wagon") {
            if (!formData.WagonNumber) {
                errors.push("Asset number is required.")
            }
        }

        return errors;
    };

    const handleGenerate = async () => {
        setShowConfirm(false);

        const errors = validateBeforeSubmit();

        if (errors.length > 0) {
            setErrorMessages(errors);
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            if (formData.GenerateType === "Locomotive") {
                const locoNumber = formData.LocoNumber.toString();
                localStorage.setItem("locoNumber", locoNumber);
                navigate("/master/dcfreport");
            }
            else if (formData.GenerateType === "Wagon") {
                const wagonNumber = formData.WagonNumber.toString();
                localStorage.setItem("wagonNumber", wagonNumber);
                navigate("/master/dcfreport");
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
                                Generate DCF Report
                            </h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Dropdown name="GenerateType" value={formData.GenerateType} onChange={handleTypeChange} options={optionList}
                                        placeholder="Select Type" style={{ width: "100%" }} />
                                </Form.Group>
                                {(formData.GenerateType !== "" && formData.GenerateType === "Locomotive") && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Asset Number</Form.Label>
                                        <Dropdown name="LocoNumber" value={formData.LocoNumber} onChange={handleLocoChange} options={locoList} optionLabel="locoNumber"
                                            optionValue="locoNumber" filter placeholder="Select Asset" style={{ width: "100%" }} />
                                    </Form.Group>
                                )}
                                {(formData.GenerateType !== "" && formData.GenerateType === "Wagon") && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Asset Number</Form.Label>
                                        <Dropdown name="WagonNumber" value={formData.WagonNumber} onChange={handleWagonChange} options={wagonList} optionLabel="wagonNumber"
                                            optionValue="wagonNumber" filter placeholder="Select Asset" style={{ width: "100%" }} />
                                    </Form.Group>
                                )}
                                <Row className="mt-4">
                                    
                                    {formData.GenerateType !== "" && (
                                        <Col className="text-end">
                                            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading.." : "Generate"}</Button>
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
                    <Modal.Title>Confirm Generate</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to generate a DCF report for this asset?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>No</Button>
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

export default GenerateDCFReport;