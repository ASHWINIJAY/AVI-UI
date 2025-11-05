import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const ChooseInspect = () => {
    const navigate = useNavigate();

    const locoNavigate = () => {
        navigate("/Landing")
    };

    const wagonNavigate = () => {
        navigate("/wagon")
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%"}}>
            <Row>
                <Col>
                    <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                        <Card.Body>
                            <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
                                Inspection Type
                            </h2>
                            <Form>
                                <div style={{display: "flex", height: "55px", width: "100%", marginBottom: "16px", alignItems: "center", justifyContent: "center"}}>
                                    <Button variant="primary" onClick={locoNavigate} style={{fontFamily: "Poppins, sans-serif", width: "225px", height: "50px"}}>
                                        Locomotive Inspection
                                    </Button>
                                </div>
                                <div style={{display: "flex", height: "55px", width: "100%", alignItems: "center", justifyContent: "center"}}>
                                    <Button variant="primary" onClick={wagonNavigate} style={{fontFamily: "Poppins, sans-serif", width: "225px", height: "50px"}}>
                                        Wagon Inspection
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

export default ChooseInspect;