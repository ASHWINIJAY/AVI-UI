import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import axios from "../api/axios";
import "../pdf/PdfStyle.css";

const PdfQuote = ({ trigger }) => {
    const [rows, setRows] = useState([]);
    const [totals, setTotals] = useState({
        refurbish: 0,
        missing: 0,
        replace: 0,
        grandTotal: 0,
    });
    const [ready, setReady] = useState(false);
    const generatedRef = useRef(false); // Prevent multiple triggers

    // 🔹 Fetch parts data from backend
    const fetchPartsData = async () => {
        const wagonNumber = localStorage.getItem("wagonNumber");
        if (!wagonNumber) return;

        try {
            const res = await axios.post(
                "QuotePdf/GenerateQuotePdf",
                parseInt(wagonNumber),
                { headers: { "Content-Type": "application/json" } }
            );
            setRows(res.data.parts || []);
            setTotals(
                res.data.totals || { refurbish: 0, missing: 0, replace: 0, grandTotal: 0 }
            );
        } catch (err) {
            console.error("Failed to fetch parts data:", err);
        }
    };

    useEffect(() => {
        fetchPartsData();
    }, []);

    // 🔹 Wait for all images + fonts to load before allowing PDF generation
    useEffect(() => {
        const waitForResources = async () => {
            try {
                await Promise.all([
                    ...Array.from(document.images).map(
                        (img) =>
                            new Promise((resolve) => {
                                if (img.complete) resolve();
                                else {
                                    img.onload = resolve;
                                    img.onerror = resolve;
                                }
                            })
                    ),
                    document.fonts ? document.fonts.ready : Promise.resolve(),
                ]);
                setReady(true);
            } catch (e) {
                console.warn("Some images or fonts failed to load:", e);
                setReady(true);
            }
        };
        waitForResources();
    }, []);

    // 🔹 Trigger PDF generation once data + resources + trigger are ready
    useEffect(() => {
        if (trigger && ready && rows.length > 0 && !generatedRef.current) {
            generatedRef.current = true; // prevent multiple generations
            generatePdfSilently();
        }
    }, [trigger, ready, rows, totals]);

    const generatePdfSilently = async () => {
        try {
            const wagonNumber = localStorage.getItem("wagonNumber");
            const wagonGroup = localStorage.getItem("wagonGroup");
            if (!wagonNumber || !wagonGroup) return;

            const element = document.getElementById("pdf-content");
            if (!element) {
                console.error("PDF element not found.");
                return;
            }

            // 🔹 Unhide element and force layout reflow
            element.style.position = "fixed";
            element.style.left = "0";
            element.style.top = "0";
            element.style.opacity = "1";
            element.style.visibility = "visible";
            element.style.background = "white";
            element.style.zIndex = "9999";
            element.style.width = "210mm"; // A4 width
            element.style.minHeight = "297mm"; // A4 height

            // 🔹 Wait for layout paint + force browser reflow
            await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 1000)));

            const opt = {
                margin: 0.2,
                filename: "temp.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                },
                jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            };

            // 🔹 Create blob
            const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

            // 🔹 Re-hide element
            element.style.position = "absolute";
            element.style.left = "-9999px";
            element.style.opacity = "0";
            element.style.visibility = "hidden";

            // 🔹 Upload
            const formData = new FormData();
            formData.append("file", pdfBlob, "temp.pdf");
            formData.append("wagonNumber", wagonNumber);
            formData.append("wagonGroup", wagonGroup);

            await axios.post("QuotePdf/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ PDF generated and uploaded successfully.");
        } catch (error) {
            console.error("❌ Silent PDF generation failed:", error);
        }
    };

    return (
        <div
            id="pdf-content"
            className="con-1"
            style={{
                position: "absolute",
                left: "-9999px",
                top: 0,
                opacity: 0,
                visibility: "hidden",
            }}
        >
            <div className="pdf-con">
                {/* Top section */}
                <div className="top-sec">
                    <div className="logo-top">
                        <div className="logo-con1">
                            <img src="/Images/Logo1.png" alt="Logo 1" />
                        </div>
                        <div className="logo-con2">
                            <img src="/Images/Logo2.png" alt="Logo 2" />
                        </div>
                    </div>
                    <div className="info-top">
                        <p className="info-bold">
                            Worldwide Rail and Mining Solutions SA (Pty) Ltd
                        </p>
                        <p>52 8th Avenue, Edenvale Gauteng 1610</p>
                        <p>Email: adminsa@wwms.co.za</p>
                        <p>T: +27 11 453 2170</p>
                        <p>Website: www.worldwideminingsolutions.co.za</p>
                        <p>Reg. No.: 2019/544337/07</p>
                        <p className="info-bold">Msomi Valuation Services (Pty) Ltd</p>
                        <p>4 Sheffield Road, Ferryvale, Nigel, 1491</p>
                        <p>T: 011 814 2047</p>
                        <p>VAT: 4400277721</p>
                    </div>
                </div>

                {/* Middle section */}
                <div className="mid-sec">
                    <h1 className="asset-head">Quote - Asset Code</h1>
                    <h3 className="process-head">Inspection Model: Loco Model</h3>

                    <div className="table-block">
                        <table className="pdf-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Form ID</th>
                                    <th>Part Description</th>
                                    <th>Refurbish Value</th>
                                    <th>Missing Value</th>
                                    <th>Replace Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    <>
                                        {rows.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{row.FormID}</td>
                                                <td>{row.PartDescr}</td>
                                                <td>
                                                    {row.RefurbishValue !== "0.00"
                                                        ? `R${row.RefurbishValue}`
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {row.MissingValue !== "0.00"
                                                        ? `R${row.MissingValue}`
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {row.ReplaceValue !== "0.00"
                                                        ? `R${row.ReplaceValue}`
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="subtotal-row">
                                            <td colSpan="3" style={{ textAlign: "right" }}>
                                                Totals
                                            </td>
                                            <td>R{totals.refurbish.toFixed(2)}</td>
                                            <td>R{totals.missing.toFixed(2)}</td>
                                            <td>R{totals.replace.toFixed(2)}</td>
                                        </tr>
                                        <tr className="grandtotal-row">
                                            <td colSpan="5" style={{ textAlign: "right" }}>
                                                Grand Total
                                            </td>
                                            <td>R{totals.grandTotal.toFixed(2)}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            Loading data...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer section */}
                <div className="foot-sec">
                    <img src="/Images/Footer1.png" alt="Footer" />
                </div>
            </div>
        </div>
    );
};

export default PdfQuote;
