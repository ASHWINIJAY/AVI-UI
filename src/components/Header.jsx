import React, { useState } from "react";
import { Navbar, Container, Button, Modal } from "react-bootstrap"; //PLEASE ADJUST (NEW)
import { useNavigate, useLocation } from "react-router-dom"; //PLEASE ADJUST (NEW)

export default function Header() {
    const location = useLocation(); //PLEASE ADD (NEW)
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false); //PLEASE ADD (NEW)

    // Only show logout if NOT on login page
    const showLogout = location.pathname !== "/";

    //PLEASE ADD (NEW)
    const clearBrowserCache = async () => {
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear service worker cache (REAL browser cache)
        if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
    };

    //PLEASE ADD (NEW)
    const handleLogoutConfirmed = async () => {
        await clearBrowserCache();
        setShowConfirm(false);
        navigate("/");
    };

    return (
        <>
            <Navbar bg="white" className="shadow-sm" expand="lg" style={{ position: "relative", height: "70px" }}>
                <Container className="d-flex justify-content-between align-items-center">
                    {/* Left spacer */}
                    <div style={{ width: "50px" }} />

                    {/* Center brand */}
                    <Navbar.Brand
                        style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "'Faster One', cursive",
                            fontSize: "2rem",
                            letterSpacing: "1px",
                            color: "#0388A6",
                            margin: 0,
                            whiteSpace: "nowrap",
                        }}
                    >
                        AVI
                    </Navbar.Brand>

                    {/* Logout button */}
                    <div className="d-flex justify-content-end">
                        {showLogout && (
                            <Button
                                variant="outline-primary"
                                onClick={() => setShowConfirm(true)}
                            >
                                Logout
                            </Button>
                        )}
                    </div>
                </Container>
            </Navbar>

            
            {/*PLEASE ADD (NEW)*/}
            <Modal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Are you sure you want to log out? Any unsaved changes will be lost.
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleLogoutConfirmed}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

