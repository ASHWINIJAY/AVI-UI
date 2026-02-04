import React, { useEffect, useState, useRef } from "react";
import { Container, Card, Spinner, Button, Modal } from "react-bootstrap";
import { ExcelRenderer } from "react-excel-renderer";
import { useNavigate } from "react-router-dom";

const API = "https://avi-app.co.za/AVIapi";

export default function DCFReport() {
    const storedLocoNumber = localStorage.getItem("locoNumber");
    const storedWagonNumber = localStorage.getItem("wagonNumber");
    const [showConfirmBack, setShowConfirmBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [cols, setCols] = useState([]);
    const hasLoaded = useRef(false);
    const navigate = useNavigate();
    const [excelBlob, setExcelBlob] = useState(null);
    const [excelFileName, setExcelFileName] = useState("");

    // ADD ↓
    const [formulas, setFormulas] = useState({});

    // ADJUST ENTIRE FUNCTION ↓
    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;

        async function loadWorkbook() {
            try {
                let url = null;
                if (storedWagonNumber !== null && storedLocoNumber === null) {
                    url = `${API}/api/DCF/generateDcfWagon/${parseInt(storedWagonNumber, 10)}`;
                    setExcelFileName(`${storedWagonNumber}_DCF_Report.xlsx`);
                } else if (storedLocoNumber !== null && storedWagonNumber === null) {
                    url = `${API}/api/DCF/generateDcfLoco/${parseInt(storedLocoNumber, 10)}`;
                    setExcelFileName(`${storedLocoNumber}_DCF_Report.xlsx`);
                } else {
                    setLoading(false);
                    return;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error(`Server returned ${res.status}`);

                const data = await res.json(); 

                const byteCharacters = atob(data.fileBytes);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob(
                    [byteArray],
                    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
                );

                setExcelBlob(blob);
                setExcelFileName(data.fileName);

                setFormulas(data.formulas || {});

                const file = new File([blob], "report.xlsx");

                ExcelRenderer(file, (err, resp) => {
                    if (err) {
                        console.error("Failed to render Excel:", err);
                        setLoading(false);
                    } else {
                        setCols(resp.cols);
                        setRows(resp.rows);
                        setLoading(false);
                    }
                });

            } catch (err) {
                console.error("Failed to load DCF file:", err);
                setLoading(false);
            }
        }

        loadWorkbook();
    }, [storedLocoNumber, storedWagonNumber]);

    const handleDownload = () => {
        if (!excelBlob) return;

        const url = window.URL.createObjectURL(excelBlob);
        const a = document.createElement("a");

        a.href = url;
        a.download = excelFileName;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleBack = async () => {
        localStorage.removeItem("locoNumber");
        localStorage.removeItem("wagonNumber");
        navigate("/master/generatedcf");  
    };

    // ADD ENTIRE FUNCTION ↓
    function getExcelColumnLetter(colIndex) {
        let letter = "";
        let temp = colIndex + 1;

        while (temp > 0) {
            const mod = (temp - 1) % 26;
            letter = String.fromCharCode(65 + mod) + letter;
            temp = Math.floor((temp - mod) / 26);
        }

        return letter;
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    // ADJUST ENTIRE TABLE ↓
    return (
        <Container fluid style={{ backgroundColor: "#025373", height: "85.5vh", maxWidth: "100%" }}>
            <Card className="mt-3 mb-3">
                <Card.Header>DCF Report</Card.Header>
                <Card.Body
                    style={{
                        maxHeight: "525px",
                        overflowX: "auto",
                        overflowY: "auto",
                        padding: "0.5rem"
                    }}
                >
                    <table style={{ borderCollapse: "collapse", width: "100%", height: "auto" }}>
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        border: "1px solid #999",
                                        padding: "6px 8px",
                                        background: "#e0e0e0",
                                        textAlign: "center",
                                        minWidth: "50px"
                                    }}
                                >
                                    #
                                </th>
                                {cols.map((col, idx) => (
                                    <th
                                        key={idx}
                                        style={{
                                            border: "1px solid #999",
                                            padding: "6px 8px",
                                            background: "#f0f0f0",
                                            textAlign: "center",
                                            minWidth: "80px"
                                        }}
                                    >
                                        {col.name || col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    style={{ background: rowIdx % 2 === 0 ? "#fff" : "#fafafa" }}
                                >
                                    <td
                                        style={{
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            background: "#f7f7f7"
                                        }}
                                    >
                                        {rowIdx + 1}
                                    </td>

                                    {row.map((cell, cellIdx) => {
                                        const colName = (cols[cellIdx]?.name || "").toLowerCase();
                                        let displayValue;

                                        if (cell === null || cell === undefined) {
                                            displayValue = "";
                                        } else if (typeof cell === "number") {
                                            // STRICT CONDITIONAL
                                            if (colName === "year") {
                                                displayValue = cell.toString(); // render integer exactly as-is
                                            } else {
                                                displayValue = cell.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                });
                                            }
                                        } else {
                                            displayValue = cell;
                                        }

                                        const excelRef = `${getExcelColumnLetter(cellIdx)}${rowIdx + 1}`;
                                        const formula = formulas[excelRef];

                                        return (
                                            <td
                                                key={cellIdx}
                                                title={formula || ""}
                                                style={{
                                                    border: "1px solid #ddd",
                                                    padding: "4px 8px",
                                                    textAlign: typeof cell === "number" ? "right" : "left",
                                                    fontFamily: "Arial, sans-serif",
                                                    whiteSpace: "nowrap",
                                                    backgroundColor: formula ? "#fff8e1" : undefined,
                                                    cursor: formula ? "help" : "default"
                                                }}
                                            >
                                                {displayValue}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card.Body>
            </Card>
            <div>
                <Button variant="secondary" onClick={() => setShowConfirmBack(true)} disabled={loading}>Back</Button>
                <Button
                    variant="success"
                    onClick={handleDownload}
                    disabled={!excelBlob}
                    className="ms-2"
                >
                    Export to Excel
                </Button>
            </div>
            <Modal show={showConfirmBack} onHide={() => !loading && setShowConfirmBack(false)}>
                <Modal.Header closeButton={!loading}>
                    <Modal.Title>Confirm Back</Modal.Title>
                </Modal.Header>
                <Modal.Body>Do you want to go back?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmBack(false)} disabled={loading}>Cancel</Button>
                    <Button variant="primary" onClick={handleBack} disabled={loading}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
