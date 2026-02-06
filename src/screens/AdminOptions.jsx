import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const AdminOptions = () => {
    const navigate = useNavigate();

    const waccNavigate = () => {
        navigate("/master/waccsetup")
    };

    const wagonNavigate = () => {
        navigate("/master/wagoninputs")
    };

    const locoNavigate = () => {
        navigate("/master/locoinputs")
    };

    const dcfNavigate = () => {
        navigate("/master/generatedcf")
    }
    const consdcfNavigate = () => {
        navigate("/master/generatedcfcon")
    }
 const assetNavigate = () => {
        navigate("/master/assetsetup")
    }
    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
                                Admin Options
                            </h2>
                            <Form>
                                <div style={{ display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center" }}>
                                    <Button variant="primary" onClick={waccNavigate} style={{ fontFamily: "Poppins, sans-serif", width: "225px", height: "50px" }}>
                                        WACC Setup
                                    </Button>
                                </div>
                                <div style={{ display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center" }}>
                                    <Button variant="primary" onClick={assetNavigate} style={{ fontFamily: "Poppins, sans-serif", width: "225px", height: "50px" }}>
                                        Asset Type Setup
                                    </Button>
                                </div>
                                 <div style={{ display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center" }}>
                                    <Button variant="primary" onClick={consdcfNavigate} style={{ fontFamily: "Poppins, sans-serif", width: "225px", height: "50px" }}>
                                        Generate DCF Consolidated Report
                                    </Button>
                                </div>
                                <div style={{ display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center" }}>
                                    <Button variant="primary" onClick={wagonNavigate} style={{ fontFamily: "Poppins, sans-serif", width: "225px", height: "50px" }}>
                                        Wagon Inputs
                                    </Button>
                                </div>
                                <div style={{ display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center" }}>
                                    <Button variant="primary" onClick={locoNavigate} style={{ fontFamily: "Poppins, sans-serif", width: "225px", height: "50px" }}>
                                        Locomotive Inputs
                                    </Button>
                                </div>
                               
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default AdminOptions;