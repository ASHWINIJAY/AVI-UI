import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WAInspect = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");

    const [rows, setRows] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const locoNumber = localStorage.getItem("locoNumber");
    const userID = localStorage.getItem("userId");
    const locoClass = localStorage.getItem("locoClass");
};

export default WAInspect;