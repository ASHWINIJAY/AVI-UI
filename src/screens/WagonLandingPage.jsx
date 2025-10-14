import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const WagonLandingPage = () => {
    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%"}}>
          <Row>
            <Col>
              <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
                <Card.Body>
                  <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
                    Info Capture
                  </h2>
                  <Form>
                    <Form.Group controlId="wagonNumber" className="mb-4">
                      <Form.Label>Wagon Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter Wagon Number"
                      />
                    </Form.Group>
    
                    <Button variant="primary" type="submit" className="w-100">
                      Continue
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      );
};

export default WagonLandingPage;