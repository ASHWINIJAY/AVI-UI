import React, { useEffect, useState } from "react";
import { Container, Form, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const API = "https://avi-app.co.za/AVIapi";

function LocoInputs() {
    const [locoList, setLocoList] = useState([]);

    const [formData, setFormData] = useState({
        LocoNumber: "",
        LocoType: "",
        NetBookValue: "",
        ScrapValue: "",
        ScrappingCost: "",
        RefurbishmentCost: "",
        LeaseTerm: "",
        LeaseIncome: "",
        EscalationRate: "",
        UseAfterRefurbish: "",
        ResidualValue: "",
        PostTax: "",
        WearTearPeriod: "",
        OperatingCosts: "",
        OperatingCostsEscalation: "",
        CorporateTaxRate: "",
        PreTax: "",
        UserId: "",
    });

    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            res = await fetch(`${API}/api/DCF/getLocos`);
            const data = await res.json();
            setLocoList(data || []);
        }
        catch (err) {
            console.error("Error fetching Loco data:", err);
            setLocoList([]);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBack = async () => {
        navigate("/master/adminoptions");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocoChange = async (e) => {
        setLoading(true);

        const locoNumber = e.value;  // PrimeReact uses e.value, not e.target.value

        setFormData((prev) => ({
            ...prev,
            LocoNumber: locoNumber,
        }));

        try {
            const res = await axios.get(`${API}/api/DCF/getInfoLoco/${parseInt(locoNumber)}`);

            setFormData(prev => ({
                ...prev,
                LocoType: res.data.locoType,
                NetBookValue: res.data.netBookValue,
                ScrapValue: res.data.scrapValue,
                ScrappingCost: res.data.scrappingCost || "",
                RefurbishmentCost: res.data.refurbishmentCost || "",
                LeaseTerm: res.data.leaseTerm || "",
                LeaseIncome: res.data.leaseIncome || "",
                EscalationRate: res.data.escalationRate || "",
                UseAfterRefurbish: res.data.useAfterRefurbish || "",
                ResidualValue: res.data.residualValue || "",
                PostTax: res.data.postTax,
                WearTearPeriod: res.data.wearTearPeriod || "",
                OperatingCosts: res.data.operatingCosts || "",
                OperatingCostsEscalation: res.data.operatingCostsEscalation || "",
                CorporateTaxRate: res.data.corporateTaxRate || "",
                PreTax: res.data.preTax,
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

        if (!formData.ScrappingCost) {
            errors.push("Scrapping Cost is required.")
        }

        if (!formData.RefurbishmentCost) {
            errors.push("Refurbishment Cost is required.");
        }

        if (!formData.LeaseTerm) {
            errors.push("Lease Term is required.")
        }

        if (!formData.LeaseIncome) {
            errors.push("Lease Income is required.")
        }

        if (!formData.EscalationRate) {
            errors.push("Escalation Rate is required.")
        }

        if (!formData.UseAfterRefurbish) {
            errors.push("Useful Life After Refurbishment is required.")
        }

        if (!formData.ResidualValue) {
            errors.push("Residual Value is required.")
        }

        if (!formData.WearTearPeriod) {
            errors.push("Wear & Tear Period is required.")
        }

        if (!formData.OperatingCosts) {
            errors.push("Operating Costs is required.")
        }

        if (!formData.OperatingCostsEscalation) {
            errors.push("Operating Costs Escalation is required.")
        }

        if (!formData.CorporateTaxRate) {
            errors.push("Corporate Tax Rate is required.")
        }

        return errors;
    };

    const handleUpdateInsert = async () => {

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

        data.append("LocoNumber", parseInt(formData.LocoNumber));
        data.append("LocoType", formData.LocoType);
        data.append("NetBookValue", formData.NetBookValue);
        data.append("ScrapValue", formData.ScrapValue);
        data.append("ScrappingCost", formData.ScrappingCost);
        data.append("RefurbishmentCost", formData.RefurbishmentCost);
        data.append("LeaseTerm", parseInt(formData.LeaseTerm));
        data.append("LeaseIncome", formData.LeaseIncome);
        data.append("EscalationRate", formData.EscalationRate);
        data.append("UseAfterRefurbish", formData.UseAfterRefurbish);
        data.append("ResidualValue", parseInt(formData.ResidualValue));
        data.append("PostTax", formData.PostTax);
        data.append("WearTearPeriod", parseInt(formData.WearTearPeriod));
        data.append("OperatingCosts", formData.OperatingCosts);
        data.append("OperatingCostsEscalation", formData.OperatingCostsEscalation);
        data.append("CorporateTaxRate", formData.CorporateTaxRate);
        data.append("PreTax", formData.PreTax);
        data.append("UserId", formData.UserId);

        try {
            await axios.post(`${API}/api/DCF/updateInsertLoco`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setShowSuccess(true);

            setFormData((prev) => ({
                ...prev,
                LocoNumber: "",
                LocoType: "",
                NetBookValue: "",
                ScrapValue: "",
                ScrappingCost: "",
                RefurbishmentCost: "",
                LeaseTerm: "",
                LeaseIncome: "",
                EscalationRate: "",
                UseAfterRefurbish: "",
                ResidualValue: "",
                PostTax: "",
                WearTearPeriod: "",
                OperatingCosts: "",
                OperatingCostsEscalation: "",
                CorporateTaxRate: "",
                PreTax: "",
                UserId: "",
            }));
        }
        catch (err) {
            console.error(err);
            setErrorMessages(["Error saving/updating locomotive input. See console for details."]);
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
        <Container className="mt-5 d-flex justify-content-center" style={{ minHeight: "82.5vh" }}>
           <Form
               className="p-4 border rounded shadow-sm"
               style={{
                   maxHeight: "80vh",        // Limit full height
                   overflowY: "auto",        // Scrollbar appears when needed
                   maxWidth: "450px",
                   width: "100%",
                   backgroundColor: "white",
                   marginBottom: "3rem",
                   borderRadius: "12px",
                   boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
               }}
           >  <h3 className="text-center mb-4" style={{ fontWeight: "bold", fontFamily: "Poppins, sans-serif" }}>Locomotive Inputs</h3>
                <Form.Group className="mb-3">
                    <Form.Label>Asset Number</Form.Label>
                    <Dropdown name="LocoNumber" value={formData.LocoNumber} onChange={handleLocoChange} options={locoList} optionLabel="locoNumber"
                        optionValue="locoNumber" filter placeholder="Select Asset" style={{ width: "100%" }} />
                </Form.Group>
                {formData.LocoNumber !== "" && (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>Asset Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="LocoType"
                                value={formData.LocoType}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Net Book Value (ZAR)</Form.Label>
                            <Form.Control
                                type="text"
                                name="NetBookValue"
                                value={formData.NetBookValue}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Scrap Value @ t0</Form.Label>
                            <Form.Control
                                type="text"
                                name="ScrapValue"
                                value={formData.ScrapValue}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Scrapping Cost (ZAR)</Form.Label>
                            <Form.Control
                                type="text"
                                name="ScrappingCost"
                                value={formData.ScrappingCost}
                                placeholder="Enter Scrapping Cost"
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
                            <Form.Label>Refurbishment Cost (ZAR)</Form.Label>
                            <Form.Control
                                type="text"
                                name="RefurbishmentCost"
                                value={formData.RefurbishmentCost}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Lease Term (Years)</Form.Label>
                            <Form.Control
                                type="number"
                                name="LeaseTerm"
                                value={formData.LeaseTerm}
                                placeholder="Enter Lease Term"
                                autoComplete="off"
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
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Escalation Rate (%)</Form.Label>
                            <Form.Control
                                type="text"
                                name="EscalationRate"
                                value={formData.EscalationRate}
                                placeholder="Enter Escalation Rate"
                                autoComplete="off"
                                inputMode="decimal"
                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.EscalationRate)}
                                onPaste={(e) => preventInvalidPaste(e, formData.EscalationRate)}
                                onDrop={(e) => {
                                    preventInvalidDrop(e, formData.EscalationRate);
                                }}
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Useful Life After Refurbishment (Years)</Form.Label>
                            <Form.Control
                                type="number"
                                name="UseAfterRefurbish"
                                value={formData.UseAfterRefurbish}
                                placeholder="Enter Use After Refurbish"
                                autoComplete="off"
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Residual Value (ZAR)</Form.Label>
                            <Form.Control
                                type="text"
                                name="ResidualValue"
                                value={formData.ResidualValue}
                                placeholder="Enter Residual Value"
                                autoComplete="off"
                                inputMode="decimal"
                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.ResidualValue)}
                                onPaste={(e) => preventInvalidPaste(e, formData.ResidualValue)}
                                onDrop={(e) => {
                                    preventInvalidDrop(e, formData.ResidualValue);
                                }}
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>WACC (Post-Tax) (%)</Form.Label>
                            <Form.Control
                                type="text"
                                name="PostTax"
                                value={formData.PostTax}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Wear & Tear Period (Years)</Form.Label>
                            <Form.Control
                                type="number"
                                name="WearTearPeriod"
                                value={formData.WearTearPeriod}
                                placeholder="Enter Wear & Tear Period"
                                autoComplete="off"
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Operating Costs (ZAR per year)</Form.Label>
                            <Form.Control
                                type="text"
                                name="OperatingCosts"
                                value={formData.OperatingCosts}
                                placeholder="Enter Operating Costs"
                                autoComplete="off"
                                inputMode="decimal"
                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.OperatingCosts)}
                                onPaste={(e) => preventInvalidPaste(e, formData.OperatingCosts)}
                                onDrop={(e) => {
                                    preventInvalidDrop(e, formData.OperatingCosts);
                                }}
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Operating Costs Escalation (%)</Form.Label>
                            <Form.Control
                                type="text"
                                name="OperatingCostsEscalation"
                                value={formData.OperatingCostsEscalation}
                                placeholder="Enter Operating Costs Escalation"
                                autoComplete="off"
                                inputMode="decimal"
                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.OperatingCostsEscalation)}
                                onPaste={(e) => preventInvalidPaste(e, formData.OperatingCostsEscalation)}
                                onDrop={(e) => {
                                    preventInvalidDrop(e, formData.OperatingCostsEscalation);
                                }}
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Corporate Tax Rate (%)</Form.Label>
                            <Form.Control
                                type="text"
                                name="CorporateTaxRate"
                                value={formData.CorporateTaxRate}
                                placeholder="Enter Corporate Tax Rate"
                                autoComplete="off"
                                inputMode="decimal"
                                onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.CorporateTaxRate)}
                                onPaste={(e) => preventInvalidPaste(e, formData.CorporateTaxRate)}
                                onDrop={(e) => {
                                    preventInvalidDrop(e, formData.CorporateTaxRate);
                                }}
                                onChange={handleChange}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>WACC (Pre-Tax) (%)</Form.Label>
                            <Form.Control
                                type="text"
                                name="PreTax"
                                value={formData.PreTax}
                                onChange={handleChange}
                                readOnly
                            >
                            </Form.Control>
                        </Form.Group>
                    </>
                )}
                <Row className="mt-4">
                    <Col>
                        <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
                    </Col>
                    {formData.LocoNumber !== "" && (
                        <Col className="text-end">
                            <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading.." : "Save Inputs"}</Button>
                        </Col>
                    )}
                </Row>

                <Modal show={showConfirm} onHide={() => !loading && setShowConfirm(false)}>
                    <Modal.Header closeButton={!loading}>
                        <Modal.Title>Confirm Save</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Do you want to save this locomotive input?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>No</Button>
                        <Button variant="primary" onClick={handleUpdateInsert} disabled={loading}>{loading ? "Loading..." : "Yes"}</Button>
                    </Modal.Footer>
                </Modal>
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
                    <Modal.Body>Locomotive input has been saved/updated successfully.</Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleSuccessClose}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Form>
            {loading && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
                    <Spinner animation="border" variant="light" style={{ width: "4rem", height: "4rem" }} />
                </div>
            )}
        </Container>
    );
}

export default LocoInputs;