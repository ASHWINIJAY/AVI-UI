import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import Loader from "../components/Loader"; // 👈 common loader
import { getCachedDataWhenOffline } from "../utils/offlineHelper";
const LandingPage = () => {
  const [locoNumber, setLocoNumber] = useState("");
  const [error, setError] = useState("");
  const [locoList, setLocoList] = useState([]);
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);
  // 🔹 Fetch loco list from API on mount
  useEffect(() => {
    const fetchLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("Landing/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setLocoList(response.data);
          // Store in localStorage for offline use
          localStorage.setItem("locoList", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch from API, fallback to localStorage:", err);
        const cached = localStorage.getItem("locoList");
        if (cached) {
          setLocoList(JSON.parse(cached));
        }
      }
    };

    fetchLocos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!locoNumber) {
      setError("Loco Number is required.");
      return;
    }
const locoNumberInt = parseInt(locoNumber, 10);
    try {
      const token = localStorage.getItem("token");
setLoading(true);

      // 🔹 Try validating with API
      const response = await api.get(
        `Landing/validateLoco/${locoNumberInt}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
console.log(response.data);
      if (response.data.isValid) {
        localStorage.setItem("locoNumber", locoNumberInt.toString());
        localStorage.setItem("locoClass", response.data.locoClass);
        localStorage.setItem("locoModel", response.data.locoModel);
        
        if(response.data.message!=null)
        {
          alert(response.data.message);
          return;
        }
        if (response?.data?.locoModel === null || response?.data?.locoModel === "") {
  alert("Missing Loco Model, Please enter a valid one")
          return;
}
        navigate("/locoinfo");
      } else {
        
        if (response?.data?.locoModel === null || response?.data?.locoModel === "") {
  alert("Missing Loco Model, Please enter a valid one")
          return;
}
else{
if(response.data.message!=null)
        {
          alert(response.data.message);
          return;
        }
}
      }
    } catch (err) {
      console.warn("API failed, fallback to offline validation:", err);

      if (err?.response?.status === 404) 
      {
        alert("LocoModel not found, Please try another loco number");
          return;
      }
      //const locoNumberInt = parseInt(storedLocoNumber, 10);
        const cacheKey = "locoMasterList";
        console.log(cacheKey);
                   const cachedData = getCachedDataWhenOffline(cacheKey, locoNumberInt);
                  if (cachedData) {
                    console.log(cachedData);
localStorage.setItem("locoNumber", locoNumberInt.toString());
        localStorage.setItem("locoClass", cachedData.locoClass);
        localStorage.setItem("locoModel", cachedData.locoModel);
        navigate("/locoinfo");
                  }
                  else{
                    console.log("test");
                  }
      
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <>
          {loading && <Loader fullscreen />}
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#025373", height: "82.5vh", maxWidth: "100%" }}
    >
      <Row>
        <Col>
          <Card
            className="p-4 shadow-sm"
            style={{ minWidth: "350px", maxWidth: "400px" }}
          >
            <Card.Body>
              <h2
                className="text-center mb-4"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                }}
              >
                Info Capture
              </h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="locoNumber" className="mb-4">
                  <Form.Label>Loco Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Loco Number"
                    autoComplete="off"
                    value={locoNumber}
                    onChange={(e) => setLocoNumber(e.target.value)}
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
    </>
  );
};

export default LandingPage;
