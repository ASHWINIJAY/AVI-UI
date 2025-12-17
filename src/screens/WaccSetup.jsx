import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card, Spinner, Modal } from "react-bootstrap";

const API = "https://avi-app.co.za/AVIapi";

function WaccSetup() {

    const [formData, setFormData] = useState({
        WaccPostCurrent: "",
        WaccPreCurrent: "",
        WaccPostNew: "",
        WaccPreNew: "",
        UserId: "",
    });

    const [showError, setShowError] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                const res = await axios.get(`${API}/api/DCF/currentSetup`);

                setFormData(prev => ({
                    ...prev,
                    WaccPostCurrent: res.data.postTax || "",
                    WaccPreCurrent: res.data.preTax || "",
                }));
            }
            catch (err) {
                console.error("Auto-populate error:", err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleBack = async () => {
        navigate("/master/adminoptions");
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

        if (!formData.WaccPostNew) {
            errors.push("WACC Post-Tax is required.")
        }

        if (!formData.WaccPreNew) {
            errors.push("WACC Pre-Tax is required.");
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
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

        data.append("CurrentPost", formData.WaccPostCurrent);
        data.append("CurrentPre", formData.WaccPreCurrent);
        data.append("PostTax", formData.WaccPostNew);
        data.append("PreTax", formData.WaccPreNew);
        data.append("UserId", formData.UserId);

        try {
            await axios.post(`${API}/api/DCF/updateSetup`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setShowSuccess(true);

            setFormData((prev) => ({
                ...prev,
                WaccPostCurrent: formData.WaccPostNew,
                WaccPreCurrent: formData.WaccPreNew,
                WaccPostNew: "",
                WaccPreNew: "",
            }));
        }
        catch (err) {
            console.error(err);
            setErrorMessages(["Error updating WACC Setup. See console for details."]);
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
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#025373", height: "86vh", maxWidth: "100%" }}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>WACC Setup</h2>
                            <Form>
                                <Form.Group className="mb-4">
                                    <Form.Label>WACC Post-Tax (%) (Current)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="WaccPostCurrent"
                                        value={formData.WaccPostCurrent}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>WACC Pre-Tax (%) (Current)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="WaccPreCurrent"
                                        value={formData.WaccPreCurrent}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>WACC Post-Tax (%) (New)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="WaccPostNew"
                                        placeholder="Enter New Post-Tax"
                                        value={formData.WaccPostNew}
                                        autoComplete="off"
                                        inputMode="decimal"
                                        // Prevent invalid characters before they get inserted
                                        onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.WaccPostNew)}
                                        // Prevent invalid paste
                                        onPaste={(e) => preventInvalidPaste(e, formData.WaccPostNew)}
                                        // Prevent invalid drop
                                        onDrop={(e) => {
                                            preventInvalidDrop(e, formData.WaccPostNew);
                                        }}
                                        // Normal change handler (we don't mutate value here)
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>WACC Pre-Tax (%) (New)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="WaccPreNew"
                                        placeholder="Enter New Pre-Tax"
                                        value={formData.WaccPreNew}
                                        autoComplete="off"
                                        inputMode="decimal"
                                        onBeforeInput={(e) => preventInvalidBeforeInput(e, formData.WaccPreNew)}
                                        onPaste={(e) => preventInvalidPaste(e, formData.WaccPreNew)}
                                        onDrop={(e) => {
                                            preventInvalidDrop(e, formData.WaccPreNew);
                                        }}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Row>
                                    <Col>
                                        <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
                                    </Col>
                                    <Col >
                                        <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={loading}>{loading ? "Loading..." : "Update"}</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Modal show={showConfirm} onHide={() => !loading && setShowConfirm(false)}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>Confirm Override</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to override the current WACC Setup?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loading}>No</Button>
                    <Button variant="primary" onClick={handleUpdate} disabled={loading}>{loading ? "Loading..." : "Yes"}</Button>
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
                <Modal.Body>WACC Setup has been updated successfully.</Modal.Body>
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
    );
}

export default WaccSetup;
