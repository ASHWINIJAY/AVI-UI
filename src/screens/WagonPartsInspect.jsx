import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Form,
  Modal,
  Image,
  Alert,
} from "react-bootstrap";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "../api/axios";

const WagonPartsInspect = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const storedWagonNumber = parseInt(localStorage.getItem("wagonNumber"));
    const storedWagonGroup = localStorage.getItem("wagonGroup");
    const storedWagonType = localStorage.getItem("wagonType");
}

export default WagonPartsInspect;