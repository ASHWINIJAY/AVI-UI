import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Container, Card, Modal, Button, Spinner, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from 'primereact/dropdown';
import ExcelJS from "exceljs";
import { InputText } from "primereact/inputtext"; //PLEASE ADD (FILTERING)
import { FilterMatchMode } from "primereact/api";
import { saveAs } from "file-saver";
import '../Dash.css'; // assume your existing css; you can add the small .selected-row rule if needed

export default function WagonDashboard() {
    const BACKEND_URL = "http://41.87.206.94/AVIapi"; 
    //const BACKEND_URL = "http://41.87.206.94/AVIapi";
    const [userRole] = useState(localStorage.getItem("userRole"));
const [score, setScore] = useState([]);
    const [allRows, setAllRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]); // array of row objects
    const [loading, setLoading] = useState(true);

    const [modalPhotos, setModalPhotos] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const [showGeneratePdfModal, setShowGeneratePdfModal] = useState(false);
    const [generatePdfTarget, setGeneratePdfTarget] = useState(null);

    const [showTickConfirmModal, setShowTickConfirmModal] = useState(false);
    const [tickTargetRow, setTickTargetRow] = useState(null);

    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [showNoPdf, setShowNoPdf] = useState(false);
    const [showNoSelectModal, setShowNoSelectModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // PDF generation state
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [showGenerateSuccessModal, setShowGenerateSuccessModal] = useState(false);
    const [showTickSuccessModal, setShowTickSuccessModal] = useState(false);
    const [recalculating, setRecalculating] = useState(false);

    const [showNoValues, setShowNoValues] = useState(false);

    const [showRecalSuccess, setShowRecalSuccess] = useState(false);
const [showNoInput, setShowNoInput] = useState(false); //PLEASE ADD (NEW)

    // Pagination/scroll persistence
    const [dtFirst, setDtFirst] = useState(0);
    const [dtRows, setDtRows] = useState(100);
    const scrollPosRef = useRef(0);
    const gridContainerRef = useRef(null);
        const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        wagonNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
        wagonGroup: { value: null, matchMode: FilterMatchMode.CONTAINS },
        inspectorName: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    // Status filter (Asset Monitor only)


const STATUS = {
    INSPECTION_DONE: "Inspection Complete",
    READY_FOR_ASSESSMENT: "ReadyForAssessment",
    ASSESSED_READY_FOR_UPLOAD: "AssessedReadyForUpload"
};

const [statusFilter, setStatusFilter] = useState(STATUS.INSPECTION_DONE);

const statusOptions = [
    { label: "Inspection Complete", value: STATUS.INSPECTION_DONE },
    { label: "Assessed Ready For Upload", value: STATUS.ASSESSED_READY_FOR_UPLOAD }
];

    //PLEASE ADD (FILTERING)
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    // ADMIN view state: default "Inspection Complete"
    const isAdmin = userRole === "Super User";
    //const [adminView, setAdminView] = useState("Inspection Complete"); // "Inspection Complete" | "Assessor Ticked"
const [adminMode, setAdminMode] = useState("Asset Monitor"); 
// "Asset Monitor" | "Assessor"

// "Assessor" | "Asset Monitor"

    const isAssessor = userRole === "Assessor";
    const isAssessorMonitor = userRole === "Asset Monitor";
const effectiveRole = isAdmin
    ? adminMode
    : isAssessor
        ? "Assessor"
        : "Asset Monitor";

    const getRowUniqueId = (row) =>
        row.id ?? `${row.wagonNumber ?? "NA"}-${row.inspectorId ?? "NA"}-${row.dateAssessed ?? "NA"}-${row.timeAssessed ?? "NA"}`;

    const saveScroll = () => {
        const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
        if (viewport) scrollPosRef.current = viewport.scrollTop;
    };

    const restoreScroll = () => {
        setTimeout(() => {
            const viewport = gridContainerRef.current?.querySelector(".p-datatable-wrapper");
            if (viewport) viewport.scrollTop = scrollPosRef.current;
        }, 50);
    };
    //PLEASE ADD (NEW)
    //PLEASE ADD (NEW)
    const fetchScore = async () => {
    try {
        let res = await fetch(`${BACKEND_URL}/api/Dashboard/getScoreList`);
        const data = await res.json();

        // 🔥 Enhance each item: add label with score + condition
        const formatted = (data || []).map(s => ({
            ...s,
            label: ` - ${s.condition}`,
            value: s.conditionScore,
            color: getScoreColor(s.conditionScore)
        }));

        setScore(formatted);
    }
    catch (err) {
        console.error("Error fetching Score data:", err);
        setScore([]);
    }
};

const getScoreColor = (score) => {
    switch (String(score)) {
        case "1": return "danger";       // red
        case "2": return "danger";
        case "3": return "warning";      // orange/yellow
        case "4": return "warning";
        case "5": return "info";         // blueish
        case "6": return "info";
        case "7": return "primary";      // blue
        case "8": return "success";      // green
        case "9": return "success";
        case "10": return "success";
        default: return "secondary";
    }
};
const getBackgroundColor = (score) => {
    switch (String(score)) {
        case "1": return "#c71e18ff"
        case "2": return "#d9534f"; // red

        case "3": return "#f0da4eff";
        case "4": return "#c3c609ff"; // orange/yellow

        case "5": return "#5bc0de"; 
        case "6": return "#3d97b2ff"; // light blue

        case "7": return "#0275d8"; // blue

        case "8": return "#5cb85c";
        case "9": return "#378537ff";
        case "10": return "#197219ff"; // green

        default: return "#6c757d"; // grey
    }
};

const scoreTemplate = (option, props) => {

    // 🔥 When no option selected → show placeholder text
    if (!option) {
        return <span style={{ opacity: 0.6 }}>{props?.placeholder}</span>;
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor: getBackgroundColor(option.value),
                color: "white",
                fontWeight: "500"
            }}
        >
            <span>{option.value}</span>
            <span>{option.label}</span>
        </div>
    );
};
    const onConditionScoreChange = (row, value) => {
    setAllRows(prev =>
        prev.map(r =>
            r.id === row.id ? { ...r, conditionScore: value } : r
        )
    );
};

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (userRole === "Assessor") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
            } else if (userRole === "Asset Monitor") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
            } else if (userRole === "Super User" && effectiveRole === "Inspection Complete") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
            } else if (userRole === "Super User" && effectiveRole === "Assessor Ticked") {
                res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
            }
            if (userRole === "Super User" && effectiveRole === "Assessor") {
    res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
}
else if (
    userRole === "Super User" &&
    effectiveRole === "Asset Monitor"
) {
    res = await fetch(`${BACKEND_URL}/api/Dashboard/getAllWagonDashboard`);
}

            const data = await res.json();
            setAllRows(data || []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setAllRows([]);
        } finally {
            setLoading(false);
            // restore scroll after render
            requestAnimationFrame(() => restoreScroll());
        }
    }, [userRole, effectiveRole]);

    //PLEASE ADJUST (NEW)
    useEffect(() => {
        fetchScore();
        fetchData();
         if (isAssessorMonitor || (isAdmin && effectiveRole === "Asset Monitor")) {
        setStatusFilter("Inspection Complete");
    } else {
        setStatusFilter(null);
    }
        //PLEASE DO NOT REMOVE
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, effectiveRole]);

    // Visible rows according to your existing filter rules — NOT changed
const visibleRows = useMemo(() => {
    let rows = allRows;

    // Role-based visibility
    if (effectiveRole === "Assessor") {
        rows = rows.filter(
            r => r.wagonStatus === STATUS.READY_FOR_ASSESSMENT
        );
    }

    if (effectiveRole === "Asset Monitor") {
        rows = rows.filter(
            r =>
                r.wagonStatus === STATUS.INSPECTION_DONE ||
                r.wagonStatus === STATUS.ASSESSED_READY_FOR_UPLOAD
        );
    }

    // Status dropdown filter (final)
    if (statusFilter) {
        rows = rows.filter(
            r => r.wagonStatus === statusFilter
        );
    }

    return rows;
}, [allRows, effectiveRole, statusFilter]);


    const rowsWithId = useMemo(() => visibleRows.map(row => ({ ...row, id: getRowUniqueId(row) })), [visibleRows]);

    //PLEASE ADD (NEW)
    const prevSelectedRef = useRef(selectedRows);

    //PLEASE ADJUST (NEW)
    useEffect(() => {
        const validIds = new Set(rowsWithId.map(r => r.id));
        const newSelected = prevSelectedRef.current.filter(s => validIds.has(s.id));

        // only update if actually different
        if (newSelected.length !== prevSelectedRef.current.length ||
            newSelected.some((r, i) => r.id !== prevSelectedRef.current[i]?.id)) {
            setSelectedRows(newSelected);
            prevSelectedRef.current = newSelected;
        }

        const total = rowsWithId.length;
        const maxFirst = total > 0 ? Math.floor((Math.max(0, total - 1)) / dtRows) * dtRows : 0;
        setDtFirst(prev => (prev > maxFirst ? maxFirst : prev));
    }, [rowsWithId, dtRows]); // removed selectedRows from dependency

    // Helper to check "all three PDFs exist" logic
    const okPdf = (v) => !!v && v !== "N/A" && v !== "No File" && v !== "Not Ready" && v !== "NotReady";
    const hasAllPdfs = (row) => {
    // 🔐 Only allowed in final status
    if (row?.wagonStatus !== STATUS.ASSESSED_READY_FOR_UPLOAD) {
        return false;
    }

    return (
        okPdf(row?.assessmentQuote) &&
        okPdf(row?.assessmentCert) &&
        okPdf(row?.assessmentSow)
    );
};
    // Photos modal
    const handleOpenModal = (photosValue, e) => {
        e?.stopPropagation();
        let photos = [];
        if (!photosValue || photosValue === "No Photos" || photosValue === "N/A") photos = [];
        else {
            try {
                if (typeof photosValue === "string") {
                    photos = photosValue.trim().startsWith("[") ? JSON.parse(photosValue) : photosValue.split(",").map(p => p.trim());
                } else if (Array.isArray(photosValue)) photos = photosValue;
                else photos = [photosValue];
                photos = photos.filter(p => p && p !== "No Photos" && p !== "N/A");
            } catch {
                photos = [photosValue];
            }
        }
        setModalPhotos(photos);
        setShowModal(true);
    };

    const renderImageCell = (rowData, field) => {
        const value = rowData[field];
        if (!value || value === "N/A") return <span>N/A</span>;
        const url = value.startsWith("http") ? value : `${BACKEND_URL}/${value}`;
        return <img src={url} alt={field} style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }} />;
    };

    // OPEN PDF view
    const handleOpenPdf = (pdfPath, e) => {
        e?.stopPropagation();
        if (!pdfPath || ["N/A", "No File", "Not Ready"].includes(pdfPath)) {
            setPdfUrl(null);
            setShowPdfModal(false);
            setShowNoPdf(true);
            return;
        }
        setPdfUrl(pdfPath.startsWith("http") ? pdfPath : `${BACKEND_URL}/${pdfPath}`);
        setShowPdfModal(true);
    };
const handleRecalculateClick = async (row) => {
        if (!row?.wagonNumber) return;

        const payload = { wagonNumber: row.wagonNumber.toString() };
        saveScroll();
        setRecalculating(true)
        try {
            const response = await fetch(`${BACKEND_URL}/api/Dashboard/recalculateValues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert("Error: " + (errorData?.message ?? JSON.stringify(errorData)));
                return;
            }
        
            setShowRecalSuccess(true);
            await fetchData();
            // don't clear selection automatically; leave that behaviour as before
        } catch (err) {
            console.error("Error recalculating:", err);
            alert("Error recalculating: " + err.message);
        } finally {
            setRecalculating(false);
            requestAnimationFrame(() => restoreScroll());
        }
    }

    // Export to excel (unchanged)
    const handleExportToExcel = async () => {
        if (!rowsWithId.length) { alert("No rows to export."); return; }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Wagon Dashboard");

        const headers = [
            "Wagon Number", "Wagon Group", "Wagon Type", "Inspector", "Date Completed", "Time Completed",
            "Time Started", "Gps Latitude", "Gps Longitude","City", "Lift Date", "Lift Lapsed", "Barrel Test Date",
            "Barrel Lapsed", "Brake Test Date", "Brake Lapsed", "Refurbish Value", "Missing Value",
            "Replace Value", "Labor Value", "LiftValue", "BarrelValue", "TotalValue", "Market Value", "Asset Value", "Wagon Status", "Upload Date",
            "ConditionScore", "OperationalStatus", //PLEASE ADD (NEW)
        ];
        worksheet.addRow(headers).font = { bold: true };

        rowsWithId.forEach(row => worksheet.addRow([
            row.wagonNumber, row.wagonGroup, row.wagonType, row.inspectorName, row.dateAssessed, row.timeAssessed,
            row.startTimeInspect, row.gpsLatitude, row.gpsLongitude,row.city, row.liftDate, row.liftLapsed, row.barrelDate,
            row.barrelLapsed, row.brakeDate, row.brakeLapsed, row.refurbishValue, row.missingValue, row.replaceValue,
            row.totalLaborValue, row.liftValue, row.BarrelValue, row.totalValue, row.marketValue, row.assetValue, row.wagonStatus, row.uploadDate,
            row.conditionScore, row.operationalStatus, //PLEASE ADD (NEW)
        ]));

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), `WagonDashboard_${new Date().toISOString().split("T")[0]}.xlsx`);
    };
const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters.global.value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const clearSelection = () => { setSelectedRows([]); };

    const buildUploadPayload = () => {
        if (!selectedRows.length) return [];
        return selectedRows.map(r => ({
            wagonNumber: r.wagonNumber,
            bodyPhotos: r.bodyPhotos,
            liftPhoto: r.liftPhoto,
            barrelPhoto: r.barrelPhoto,
            brakePhoto: r.brakePhoto,
            assessmentQuote: r.assessmentQuote,
            assessmentCert: r.assessmentCert,
            assessmentSow: r.assessmentSow,
            wagonPhoto: r.wagonPhoto,
            missingPhotos: r.missingPhotos,
            replacePhotos: r.replacePhotos,
        }));
    };

    // Upload (only use when Asset Monitor – UI shows button only for that role)
    const handleUploadConfirmed = async () => {
        const payload = buildUploadPayload();
        if (!payload.length) { setShowNoSelectModal(true); return; }

        saveScroll();
        setShowConfirmModal(false);
        setUploading(true);
        try {
            const resp = await fetch(`${BACKEND_URL}/api/Dashboard/uploadWagons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
            await resp.json();
            setShowSuccessModal(true);
            await fetchData();
            clearSelection();
        } catch (err) { alert("Upload failed: " + err.message); }
        finally { setUploading(false); requestAnimationFrame(() => restoreScroll()); }
    };
const mapOperationalStatus = (score) => {
    switch (String(score)) {
        case "1":  return "Scrap only";
        case "2":  return "Non-operational, wreck repair";
        case "3":  return "Non-operational, needs major overhaul";
        case "4":  return "Partially operational or limited use";
        case "5":  return "Operational but maintenance is needed";
        case "6":  return "Operational but needs scheduled repair";
        case "7":  return "Operational with minor issues";
        case "8":
        case "9":
        case "10": return "Fully operational";
        default:   return "";
    }
};
const onConditionStatusInstantUpdate = (row, value) => {
    const newStatus = mapOperationalStatus(value);

    setAllRows(prev =>
        prev.map(r =>
            r.id === row.id
                ? {
                    ...r,
                    conditionScore: value,
                    operationalStatus: newStatus
                }
                : r
        )
    );
};

    // Confirm tick (assessor tick)
    const confirmTickWagon = async () => {
    if (!tickTargetRow) return;

    saveScroll();

    try {
        let url = "";
        let payload = {
            wagonNumber: Number(tickTargetRow.wagonNumber)
        };

        // 🚦 STATUS-BASED API ROUTING
        if (
            effectiveRole === "Asset Monitor" &&
            tickTargetRow.wagonStatus === STATUS.INSPECTION_DONE
        ) {
            // InspectionDone → ReadyForAssessment
            url = `${BACKEND_URL}/api/Dashboard/markReadyForAssessment`;
        }
        else if (
            effectiveRole === "Assessor" &&
            tickTargetRow.wagonStatus === STATUS.READY_FOR_ASSESSMENT
        ) {
            // ReadyForAssessment → AssessedReadyForUpload
            url = `${BACKEND_URL}/api/Dashboard/markAssessedReadyForUpload`;
        }
        else {
            alert("Invalid status transition");
            return;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        setShowTickConfirmModal(false);
        setTickTargetRow(null);
        setShowTickSuccessModal(true);

        await fetchData();
    }
    catch (err) {
        console.error("Tick failed:", err);
        alert("Failed to update status");
    }
    finally {
        requestAnimationFrame(() => restoreScroll());
    }
};


    //PLEASE ADD (NEW)
    const updateConditionScore = async (wagonNumber, value) => {
        saveScroll();
        try {
            await fetch(`${BACKEND_URL}/api/Dashboard/updateCondition`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wagonNumber: wagonNumber.toString(),
                    conditionScore: String(value)
                })
            });
             //await fetchData();
        } catch (err) {
            console.error("Failed to update condition score:", err);
            alert("Failed to save Condition Score");
        }
        finally {
            requestAnimationFrame(() => restoreScroll());
        }
    };
    // Generate PDFs: sequential, with overlay spinner, preserves scroll and pagination
    const handleGeneratePdfClick = (row) => {
        setGeneratePdfTarget(row);
        setShowGeneratePdfModal(true);
    };

    const confirmGeneratePdfs = async () => {
         if (!generatePdfTarget) return;
        // Save scroll & pagination
        if (!generatePdfTarget?.conditionScore || generatePdfTarget.conditionScore === "") {
        alert("Please select a Condition Score before generating PDFs.");
        return;  // stop PDF generation
    }
            let resp = await fetch(`${BACKEND_URL}/api/Dashboard/checkWagonInputs/${parseInt(generatePdfTarget.wagonNumber)}`);
        const resMessage = await resp.json();
        if (resMessage.message === "No") {
            setShowGeneratePdfModal(false);
            setShowNoInput(true);
            return;
        }
        saveScroll();
        setShowGeneratePdfModal(false);
        setGeneratingPdf(true);

        const wagonNumber = generatePdfTarget.wagonNumber.toString();
        const userId = localStorage.getItem("userId");

        try {
            const endpoints = [
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveQuotePdf` },
                { url: `${BACKEND_URL}/api/CertPdf/GenerateAndSaveCertPdf` },
                { url: `${BACKEND_URL}/api/QuotePdf/GenerateAndSaveSowPdf` }
            ];

            for (const ep of endpoints) {
                const res = await fetch(ep.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, wagonNumber }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed at ${ep.url}: ${res.status} ${errText}`);
                }
                // wait a tick so UI updates; ensures strict ordering
                await new Promise(r => setTimeout(r, 250));
            }

            // success
            setShowGenerateSuccessModal(true);
            await fetchData();
        } catch (err) {
            console.error("Error generating PDFs:", err);
            alert("Error generating PDFs: " + (err.message || err));
        } finally {
            setGeneratingPdf(false);
            requestAnimationFrame(() => restoreScroll());
            setGeneratePdfTarget(null);
        }
    };

    // Row class to show selected highlight only when checkbox is selected
    const rowClassName = (rowData) => {
        if (!rowData || !rowData.id) return '';
        return selectedRows.some(r => r.id === rowData.id) ? 'p-highlight selected-row' : '';
    };

    // Header select-all checkbox template (only visible for non-assesor roles)
    const renderHeaderSelectAll = () => {
        // compute selectable rows (those with all PDFs)
        const selectable = rowsWithId.filter(r => hasAllPdfs(r));
        const selectableIds = new Set(selectable.map(r => r.id));
        const allSelected = selectable.length > 0 && selectable.every(r => selectedRows.some(s => s.id === r.id));
        const someSelected = selectable.some(r => selectedRows.some(s => s.id === r.id)) && !allSelected;

        const toggleAll = (checked) => {
            if (checked) {
                // add all selectable rows (avoid duplicates)
                const newSelected = [...selectedRows];
                for (const r of selectable) {
                    if (!newSelected.some(s => s.id === r.id)) newSelected.push(r);
                }
                setSelectedRows(newSelected);
            } else {
                // remove all selectable rows
                setSelectedRows(prev => prev.filter(s => !selectableIds.has(s.id)));
            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    ref={el => {
                        if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
            </div>
        );
    };

    const canTick = (row) => {
    // Asset Monitor → InspectionDone → ReadyForAssessment
    if (
        effectiveRole === "Asset Monitor" &&
        row.wagonStatus === STATUS.INSPECTION_DONE
    ) {
        return true;
    }

    // Assessor → ReadyForAssessment → AssessedReadyForUpload
    if (
        effectiveRole === "Assessor" &&
        row.wagonStatus === STATUS.READY_FOR_ASSESSMENT
    ) {
        return true;
    }

    return false;
};


const isUploadSelectable = (row) => {
    return (
        effectiveRole === "Asset Monitor" &&
        row.wagonStatus === STATUS.ASSESSED_READY_FOR_UPLOAD &&
        hasAllPdfs(row)
    );
};

const canUpload =
    effectiveRole === "Asset Monitor" &&
    selectedRows.length > 0 &&
    selectedRows.every(
        r => r.wagonStatus === STATUS.ASSESSED_READY_FOR_UPLOAD
    );


    // Single-row checkbox template (bigger checkbox, disabled when not all PDFs exist)
const renderRowCheckbox = (row) => {
    const isChecked = selectedRows.some(r => r.id === row.id);
    const tickAllowed = canTick(row);
    const uploadAllowed = isUploadSelectable(row);

    const onChange = (e) => {
        e.stopPropagation();

        // ✅ STATUS TRANSITION (InspectionDone → ReadyForAssessment)
        if (
            effectiveRole === "Asset Monitor" &&
            row.wagonStatus === STATUS.INSPECTION_DONE
        ) {
            setTickTargetRow(row);
            setShowTickConfirmModal(true);
            return;
        }

        // ✅ STATUS TRANSITION (ReadyForAssessment → AssessedReadyForUpload)
        if (
            effectiveRole === "Assessor" &&
            row.wagonStatus === STATUS.READY_FOR_ASSESSMENT
        ) {
            setTickTargetRow(row);
            setShowTickConfirmModal(true);
            return;
        }

        // ✅ UPLOAD SELECTION ONLY
        if (uploadAllowed) {
            if (e.target.checked) {
                setSelectedRows(prev =>
                    prev.some(r => r.id === row.id)
                        ? prev
                        : [...prev, row]
                );
                setShowConfirmModal(true);
            } else {
                setSelectedRows(prev =>
                    prev.filter(r => r.id !== row.id)
                );
            }
        }
    };

    return (
        <div
            style={{ display: "flex", justifyContent: "center" }}
            onClick={(ev) => ev.stopPropagation()}
        >
            <input
                type="checkbox"
                checked={isChecked}
                disabled={!tickAllowed && !uploadAllowed}
                onChange={onChange}
                style={{
                    transform: "scale(1.35)",
                    cursor:
                        tickAllowed || uploadAllowed
                            ? "pointer"
                            : "not-allowed"
                }}
            />
        </div>
    );
};



    // Prevent row clicks from selecting (selection is only via checkbox)
    const onRowClick = (e) => {
        // do nothing — user explicitly wanted selection only via checkboxes
        e.originalEvent?.stopPropagation?.();
    };

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
            <Spinner animation="border" />
        </Container>
    );

    return (
        <Container fluid>
            <Card className="mt-3 mb-3">
                <Card.Header>Wagon Dashboard</Card.Header>
                <Card.Body style={{ height: 640, width: "100%" }}>
                    <div className="d-flex justify-content-start mb-3">
                        <Button variant="success" size="sm" onClick={handleExportToExcel} className="me-2">Export to Excel</Button>
                        {(isAssessorMonitor || (isAdmin && effectiveRole === "Assessor Ticked")) && (
                            <Button
    variant="primary"
    size="sm"
    disabled={!canUpload}
    onClick={() =>
        selectedRows.length
            ? setShowConfirmModal(true)
            : setShowNoSelectModal(true)
    }
>
    Upload
</Button>
   )}
   
                       {isAdmin && (
                      <div className="d-flex align-items-center mb-2">
    <span className="me-2 fw-bold">Role:</span>  
    <Form.Select
        size="sm"
        value={adminMode}
        onChange={(e) => {
            setAdminMode(e.target.value);
            setSelectedRows([]);
            setDtFirst(0);
            setStatusFilter(STATUS.INSPECTION_DONE);
        }}
        style={{ width: 220, marginLeft: 8 }}
    >
        <option value="Asset Monitor">Asset Monitor Role</option>
        <option value="Assessor">Assessor Role</option>
    </Form.Select>
    </div>
)}
{(isAssessorMonitor || (effectiveRole === "Asset Monitor")) && (
    <div className="d-flex align-items-center mb-2">
    <span className="me-2 fw-bold">Status:</span>
    <Dropdown
        value={statusFilter}
        options={statusOptions}
        onChange={(e) => {
            setStatusFilter(e.value);
            setSelectedRows([]);
            setDtFirst(0);
        }}
        style={{ width: 300 }}
    />
</div>

)}

                        <div style={{ marginLeft: 12, alignSelf: "center" }}>{selectedRows.length ? `${selectedRows.length} selected` : ""}</div>
                           
                    </div>
  <div className="d-flex justify-content-start mb-2">
                        <span className="p-input-icon-left">
                            <InputText
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Search Wagon Number, Group, Inspector"
                                style={{ width: "500px" }}
                            />
                        </span>
                       


                    </div>
                    <div style={{ position: "relative" }} ref={gridContainerRef}>
                        {/* overlay spinners */}
                        {(uploading || generatingPdf) && (
                            <div style={{ position: "absolute", zIndex: 10, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.6)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Spinner animation="border" />
                            </div>
                        )}

                        <DataTable
                            value={rowsWithId}
                            paginator
                            first={dtFirst}
                            rows={dtRows}
                            rowsPerPageOptions={[25, 50, 100, 200]}
                            onPage={(e) => {
                                setDtFirst(e.first);
                                setDtRows(e.rows);
                                saveScroll();
                            }}
                            className="p-datatable-sm"
                            scrollable
                            scrollHeight="510px"
                            dataKey="id"
                            rowClassName={rowClassName}
                            onRowClick={onRowClick}
                            filters={filters} 
                            globalFilterFields={["wagonNumber", "wagonGroup", "inspectorName"]} 
                        >
                            {/* Checkbox column (custom checkbox) */}
                            <Column
                                header={isAssessor || isAdmin ? "" : renderHeaderSelectAll()} //PLEASE ADJUST (NEW)
                                headerStyle={{ width: '3rem' }}
                                body={(row) => renderRowCheckbox(row)}
                                style={{ width: '3rem' }}
                            />
                           {(effectiveRole === "Asset Monitor") && (
                               <Column
                                   header="Recalculate Values"
                                   body={(row) => {
                                       const isInsCompleted =
                                           row.uploadStatus === STATUS.INSPECTION_DONE;
                           
                                       // ✅ Assessor → always allowed
                                       // ✅ Admin → only when inspection is completed
                                       if (effectiveRole === "Asset Monitor"  && isInsCompleted) {
                return (
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRecalculateClick(row);
                        }}
                    >
                        Recalculate
                    </Button>
                );
            }

            return null; // hide button
        }}
        style={{ minWidth: 150 }}
    />
)}

                         {effectiveRole === "Asset Monitor" && (
    <Column
        header="Generate PDFs"
        body={(row) => {
            const isReadyForAssessment =
                row.wagonStatus === STATUS.ASSESSED_READY_FOR_UPLOAD;

            const alreadyGenerated = hasAllPdfs(row);

            const disabled =
                !isReadyForAssessment || alreadyGenerated;

            return (
                <Button
                    size="sm"
                    disabled={disabled}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleGeneratePdfClick(row);
                    }}
                >
                    Generate
                </Button>
            );
        }}
        style={{ minWidth: 150 }}
    />
)}


                            {/* All other columns are kept intact */}
                            <Column field="wagonNumber" header="Wagon Number" style={{ minWidth: 120 }} />
                            <Column field="wagonGroup" header="Wagon Group" style={{ minWidth: 120 }} />
                            <Column field="wagonType" header="Wagon Type" style={{ minWidth: 140 }} />
                            <Column field="inspectorName" header="Inspector" style={{ minWidth: 140 }} />
                            <Column field="dateAssessed" header="Date Completed" style={{ minWidth: 110 }} />
                            <Column field="timeAssessed" header="Time Completed" style={{ minWidth: 110 }} />
                            <Column field="startTimeInspect" header="Time Started" style={{ minWidth: 110 }} />
                            <Column field="gpsLatitude" header="Gps Latitude" style={{ minWidth: 120 }} />
                            <Column field="gpsLongitude" header="Gps Longitude" style={{ minWidth: 120 }} />
                            <Column field="city" header="City" style={{ minWidth: 120 }} />
                            <Column header="Body Photos" body={(row) => <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenModal(row.bodyPhotos, e); }}>View</Button>} style={{ minWidth: 120 }} />
                            <Column header="Lift Photo" body={(row) => <div onClick={e => e.stopPropagation()}>{renderImageCell(row, 'liftPhoto')}</div>} style={{ minWidth: 140 }} />
                            <Column field="liftDate" header="Lift Date" style={{ minWidth: 110 }} />
                            <Column field="liftLapsed" header="Lift Lapsed" style={{ minWidth: 110 }} />
                            <Column header="Barrel Photo" body={(row) => <div onClick={e => e.stopPropagation()}>{renderImageCell(row, 'barrelPhoto')}</div>} style={{ minWidth: 140 }} />
                            <Column field="barrelDate" header="Barrel Test Date" style={{ minWidth: 110 }} />
                            <Column field="barrelLapsed" header="Barrel Lapsed" style={{ minWidth: 110 }} />
                            <Column header="Brake Photo" body={(row) => <div onClick={e => e.stopPropagation()}>{renderImageCell(row, 'brakePhoto')}</div>} style={{ minWidth: 140 }} />
                            <Column field="brakeDate" header="Brake Test Date" style={{ minWidth: 110 }} />
                            <Column field="brakeLapsed" header="Brake Lapsed" style={{ minWidth: 110 }} />
                            <Column field="refurbishValue" header="Refurbish Value" style={{ minWidth: 120 }} />
                            <Column field="missingValue" header="Missing Value" style={{ minWidth: 120 }} />
                            <Column field="replaceValue" header="Replace Value" style={{ minWidth: 120 }} />
                            <Column field="totalLaborValue" header="Labor Value" style={{ minWidth: 120 }} />
                            <Column field="liftValue" header="Lift Value" style={{ minWidth: 120 }} />
                            <Column field="barrelValue" header="Barrel Value" style={{ minWidth: 120 }} />
                            <Column field="totalValue" header="Total Value" style={{ minWidth: 120 }} />
                            <Column field="marketValue" header="Market Value" style={{ minWidth: 140 }} />
                            <Column field="assetValue" header="Asset Value" style={{ minWidth: 120 }} />
                            <Column header="Assessment Quote" body={(row) => row.assessmentQuote && row.assessmentQuote !== "N/A" ? <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); handleOpenPdf(row.assessmentQuote, e); }}>View PDF</Button> : <span>N/A</span>} style={{ minWidth: 160 }} />
                            <Column header="Assessment Cert" body={(row) => row.assessmentCert && row.assessmentCert !== "N/A" ? <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); handleOpenPdf(row.assessmentCert, e); }}>View PDF</Button> : <span>N/A</span>} style={{ minWidth: 140 }} />
                            <Column header="Assessment SOW" body={(row) => row.assessmentSow && row.assessmentSow !== "N/A" ? <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); handleOpenPdf(row.assessmentSow, e); }}>View PDF</Button> : <span>N/A</span>} style={{ minWidth: 140 }} />
                            <Column field="wagonStatus" header="Wagon Status" style={{ minWidth: 120 }} />
                            <Column field="uploadDate" header="Upload Date" style={{ minWidth: 120 }} />
                            <Column header="Wagon Photo" body={row => <div onClick={e => e.stopPropagation()}>{renderImageCell(row, 'wagonPhoto')}</div>} style={{ minWidth: 140 }} />
                            <Column header="Missing Photos" body={row => <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenModal(row.missingPhotos, e); }}>View</Button>} style={{ minWidth: 140 }} />
                            <Column header="Replace Photos" body={row => <Button size="sm" onClick={(e) => { e.stopPropagation(); handleOpenModal(row.replacePhotos, e); }}>View</Button>} style={{ minWidth: 140 }} />
                             {/*PLEASE ADJUST (NEW)*/}
                           
                                <Column
    header="Condition Score"
    style={{ minWidth: 140 }}
    body={(row) => (
        <Dropdown
            value={row.conditionScore}
            options={score}
            optionLabel="label"
            optionValue="value"
            itemTemplate={scoreTemplate}
            valueTemplate={scoreTemplate}
            placeholder="Select Score"
            disabled={effectiveRole === "Assessor"}   // ✅ KEY LINE
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
                onConditionScoreChange(row, e.value);
                updateConditionScore(row.wagonNumber, e.value);
                onConditionStatusInstantUpdate(row, e.value);
            }}
            className="w-100"
        />
    )}
/>

                            

                           
                                <Column
                                    header="Operational Status"
                                    field="operationalStatus"
                                    style={{ minWidth: 140 }}
                                    body={(row) => row?.operationalStatus ?? ""}
                                />
                          
                       
                        </DataTable>
                    </div>
                </Card.Body>
            </Card>

            {/* Photos Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" scrollable>
                <Modal.Header closeButton><Modal.Title>Photos</Modal.Title></Modal.Header>
                <Modal.Body>
                    {modalPhotos.length ? (
                        <div className="d-flex flex-wrap gap-2">
                            {modalPhotos.map((url, idx) => (
                                <img key={idx} src={url.startsWith("http") ? url : `${BACKEND_URL}/${url}`} alt={`photo-${idx}`} style={{ maxWidth: 150, maxHeight: 150, objectFit: "cover" }} />
                            ))}
                        </div>
                    ) : (
                        <p>No photos available.</p>
                    )}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Generate PDF Confirmation Modal */}
            <Modal show={showGeneratePdfModal} onHide={() => setShowGeneratePdfModal(false)}>
                <Modal.Header closeButton><Modal.Title>Generate PDFs</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to (re)generate the PDFs for Wagon <b>{generatePdfTarget?.wagonNumber}</b>?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGeneratePdfModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmGeneratePdfs}>Generate</Button>
                </Modal.Footer>
            </Modal>

            {/* Generate success modal */}
            <Modal show={showGenerateSuccessModal} onHide={() => setShowGenerateSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>PDFs Generated</Modal.Title></Modal.Header>
                <Modal.Body>All PDFs have been successfully generated.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowGenerateSuccessModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
<Modal show={showRecalSuccess} onHide={() => setShowRecalSuccess(false)}>
                <Modal.Header closeButton><Modal.Title>Values Recalculate</Modal.Title></Modal.Header>
                <Modal.Body>Missing values recalculated successfully.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowRecalSuccess(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
            {/* Tick Confirmation Modal */}
            <Modal show={showTickConfirmModal} onHide={() => setShowTickConfirmModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Tick</Modal.Title></Modal.Header>
                <Modal.Body>
    {tickTargetRow?.wagonStatus === STATUS.INSPECTION_DONE && (
        <>
            Are you sure you want to tick Wagon{" "}
            <b>{tickTargetRow?.wagonNumber}</b> for{" "}
            <b>Ready For Assessment</b>?
        </>
    )}

    {tickTargetRow?.wagonStatus === STATUS.READY_FOR_ASSESSMENT && (
        <>
            Are you sure you want to tick Wagon{" "}
            <b>{tickTargetRow?.wagonNumber}</b> for{" "}
            <b>Assessed Ready For Upload</b>?
        </>
    )}
</Modal.Body>
<Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTickConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmTickWagon}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            {/* Tick success modal */}
            <Modal show={showTickSuccessModal} onHide={() => setShowTickSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>Tick Successful</Modal.Title></Modal.Header>
                <Modal.Body>Wagon was successfully ticked.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowTickSuccessModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>

            {/* PDF Viewer Modal */}
            <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl">
                <Modal.Header closeButton><Modal.Title>PDF Viewer</Modal.Title></Modal.Header>
                <Modal.Body>
                    {pdfUrl ? <iframe src={pdfUrl} style={{ width: "100%", height: "600px" }} title="PDF Viewer"></iframe> : <p>No PDF available.</p>}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowPdfModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No PDF Modal */}
            <Modal show={showNoPdf} onHide={() => setShowNoPdf(false)}>
                <Modal.Header closeButton><Modal.Title>No PDF</Modal.Title></Modal.Header>
                <Modal.Body>No PDF file is available for this selection.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoPdf(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* No Selection Modal */}
            <Modal show={showNoSelectModal} onHide={() => setShowNoSelectModal(false)}>
                <Modal.Header closeButton><Modal.Title>No Selection</Modal.Title></Modal.Header>
                <Modal.Body>Please select at least one row to perform this action.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoSelectModal(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Upload Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton><Modal.Title>Confirm Upload</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to upload the selected wagons?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleUploadConfirmed}>Upload</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showNoInput} onHide={() => setShowNoInput(false)}>
                <Modal.Header closeButton><Modal.Title>Missing Inputs</Modal.Title></Modal.Header>
                <Modal.Body>The inputs for this wagon cannot be found. Therefore the PDFs cannot be generated. Please contact your administrator.</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => setShowNoInput(false)}>Close</Button></Modal.Footer>
            </Modal>

            {/* Upload Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton><Modal.Title>Upload Successful</Modal.Title></Modal.Header>
                <Modal.Body>Wagons have been successfully uploaded.</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowSuccessModal(false)}>OK</Button></Modal.Footer>
            </Modal>
        </Container>
    );
}