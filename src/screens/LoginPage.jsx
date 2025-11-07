import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import Loader from "../components/Loader"; // 👈 common loader

// 🔹 Helper to decode JWT expiry
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode base64
    const expiry = payload.exp * 1000; // exp is in seconds → convert to ms
    return Date.now() < expiry;
  } catch (e) {
    return false;
  }
}

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const [locoList, setLocoList] = useState([]);
const [locoMasterList, setLocoMasterList] = useState([]);

  // 🔹 Helper function for navigation
  const redirectUser = (role) => {
    const normalizedRole = (role || "").trim().toLowerCase();
    if (normalizedRole === "super user") {
      navigate("/master/welcome");
    } else if (normalizedRole === "assessor") {
      navigate("/master/welcome");
    } else {
      navigate("/choose");
    }
  };
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

 useEffect(() => {
    const getAllLocos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("LocoInfoCapture/getAllLocos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setLocoMasterList(response.data);
          // Store in localStorage for offline use
          localStorage.setItem("locoMasterList", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Failed to fetch from API, fallback to localStorage:", err);
        const cached = localStorage.getItem("locoMasterList");
        if (cached) {
          setLocoMasterList(JSON.parse(cached));
        }
      }
    };

    getAllLocos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Try normal login API
      const response = await api.post("Auth/login", {
        username,
        password,
      });

      // Store fresh token & user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userRole", response.data.userRole);
      localStorage.setItem("name", response.data.name);

      redirectUser(response.data.userRole);

    } catch (err) {
      console.error("Login error:", err);
//alert("test");
      // ✅ Offline fallback
      const isOffline =
    !navigator.onLine ||
    err.message === "Network Error" ||
    err.code === "ERR_NETWORK";

  if (isOffline) {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");

        if (token && role && isTokenValid(token)) {
          console.warn("Offline mode: using stored token");
          setError("You are offline.Certian features not available");
          redirectUser(role);
          return;
        } else {
          setError("No internet connection and no valid saved session.");
        }
      } else if (err.response && err.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
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
            <Card className="p-4 shadow-sm" style={{ minWidth: "350px", maxWidth: "400px" }}>
              <Card.Body>
                <h2 className="text-center mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: "700" }}>
                  Login
                </h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="username" className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="password" className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100">
                    Login
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

export default LoginPage;
