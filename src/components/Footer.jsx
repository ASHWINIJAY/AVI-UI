import React from "react";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white text-center py-3 shadow-sm mt-auto">
      <Container>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
          © 2025 Codex-IT. All Rights Reserved.
        </span>
      </Container>
    </footer>
  );
}