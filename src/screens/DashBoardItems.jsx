import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Modal, Image, Form, Card } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import api from "../api/axios";
import axios from "../api/axios";
/*
  Requirements:
    - npm install primereact primeicons
    - Add PrimeReact CSS imports to index.js
*/

const DashBoardItems = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoList, setPhotoList] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [modalTitle, setModalTitle] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certLink, setCertLink] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteLink, setQuoteLink] = useState("");
  const [quoteTitle, setQuoteTitle] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const baseUrl = "https://avi-app.co.za/AVIapi/"; // fallback base URL

  useEffect(() => {
    fetchDashboardData();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("DashBoardItems");
      setDashboardData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching dashboard items:", err);
      setDashboardData([]);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  // ---------- Helpers ----------
const normalizeSinglePath = (p) => {
  if (!p) return "";

  let clean = p
    .toString()
    .trim()
    .replace(/\\/g, "/")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // ✅ 1. If it’s already a full URL, verify /AVIapi/ is present
  if (/^https?:\/\//i.test(clean)) {
    if (!clean.includes("/AVIapi/")) {
      clean = clean.replace("https://avi-app.co.za/", "https://avi-app.co.za/AVIapi/");
    }
    return encodeURI(clean);
  }

  // ✅ 2. If it starts with domain but missing http
  if (clean.startsWith("avi-app.co.za/")) {
    clean = "http://" + clean;
    if (!clean.includes("/AVIapi/")) {
      clean = clean.replace("https://avi-app.co.za/", "https://avi-app.co.za/AVIapi/");
    }
    return encodeURI(clean);
  }

  // ✅ 3. Remove duplicate AVIapi
  if (clean.startsWith("AVIapi/")) {
    clean = clean.replace(/^AVIapi\//, "");
  }

  // ✅ 4. Handle special folders
  if (clean.startsWith("certificates/") || clean.startsWith("quotes/")) {
    return encodeURI(baseUrl + clean);
  }

  // ✅ 5. Default fallback
  if (!clean.startsWith("uploads/")) {
    clean = "uploads/" + clean;
  }

  return encodeURI(baseUrl + clean);
};




  const normalizePhotosToArray = (photoField) => {
    if (!photoField) return [];

    if (Array.isArray(photoField)) return photoField.flat().filter(Boolean).map(normalizeSinglePath);

    if (typeof photoField === "string") {
      const s = photoField.trim();
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.filter(Boolean).map(normalizeSinglePath);
        } catch {}
      }
      return s.split(";").map(p => p.trim()).filter(Boolean).map(normalizeSinglePath);
    }
    return [];
  };

  // ---------- Photo modal ----------
  const openPhotoModal = (photoField, title) => {
    let photos = Array.isArray(photoField) ? photoField.flat().filter(Boolean).map(normalizeSinglePath)
                                          : normalizePhotosToArray(photoField);
    if (!photos || photos.length === 0) {
      alert("No photos available");
      return;
    }
    setPhotoList(photos);
    setModalTitle(title);
    setSelectedPhotoIndex(0);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoList([]);
    setSelectedPhotoIndex(0);
  };

  const showPrevPhoto = () => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photoList.length - 1));
  const showNextPhoto = () => setSelectedPhotoIndex((prev) => (prev < photoList.length - 1 ? prev + 1 : 0));

  // ---------- Certificate & Quote ----------
  const openCertModal = (link, title) => {
    if (!link) return alert("No certificate available");
    const first = Array.isArray(link) ? link[0] : link;
    setCertLink(normalizeSinglePath(first));
    setCertTitle(title);
    setShowCertModal(true);
  };

  const closeCertModal = () => setShowCertModal(false);

  const openQuoteModal = (link, title) => {
    if (!link) return alert("No quote available");
    const first = Array.isArray(link) ? link[0] : link;
    console.log("📎 Quote raw link:", first);
  console.log("📎 Normalized:", normalizeSinglePath(first));
    setQuoteLink(normalizeSinglePath(first));
    setQuoteTitle(title);
    setShowQuoteModal(true);
  };

  const closeQuoteModal = () => setShowQuoteModal(false);

  // ---------- Filter ----------
  const filteredData = dashboardData.filter((item) => {
    const locoNumber = item?.locoNumber ?? "";
    const inspectorName = (item?.inspectorName ?? "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return locoNumber.toString().includes(search) || inspectorName.includes(search);
  });

  // ---------- Upload ----------
  const handleUploadSelected = async () => {
    try {
      const selectedRecords = selectedRows.map(r => r.record);
      if (!selectedRecords.length) return alert("Select at least one item.");

      const response = await axios.post(
        `${baseUrl}api/DashBoardItems/upload`,
        JSON.stringify(selectedRecords),
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/zip"
          },
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DashboardUploads_${new Date().toISOString()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      await fetchDashboardData();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    }
  };

  // ---------- PrimeReact renderers ----------
  const actionButton = (label, onClick) => <Button size="sm" onClick={onClick}>{label}</Button>;

  const bodyPhotosTemplate = rowData => normalizePhotosToArray(rowData.bodyPhotos).length > 0
    ? actionButton("View", () => openPhotoModal(rowData.bodyPhotos, "Body Photos")) : <span>-</span>;

  const liftPhotosTemplate = rowData => normalizePhotosToArray(rowData.liftPhotos).length > 0
    ? actionButton("View", () => openPhotoModal(rowData.liftPhotos, "Lift Photos")) : <span>-</span>;

  const assessmentPhotosTemplate = rowData => normalizePhotosToArray(rowData.assessmentPhotos).length > 0
    ? actionButton("View", () => openPhotoModal(rowData.assessmentPhotos, "Assessment Photos")) : <span>-</span>;

  const allPhotosTemplate = rowData => {
    const combined = [
      ...normalizePhotosToArray(rowData.bodyPhotos),
      ...normalizePhotosToArray(rowData.liftPhotos),
      ...normalizePhotosToArray(rowData.assessmentPhotos)
    ].filter(Boolean);
    return combined.length > 0 ? actionButton("View All", () => openPhotoModal(combined, "All Photos")) : <span>-</span>;
  };

  const certTemplate = rowData => rowData.assessmentCert ? actionButton("View", () => openCertModal(rowData.assessmentCert, "Certificate")) : <span>-</span>;

  const quoteTemplate = rowData => rowData.assessmentQuote ? actionButton("View", () => openQuoteModal(rowData.assessmentQuote, "Quote")) : <span>-</span>;

  // ---------- Render ----------
  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: "calc(100vh - 80px)" }}>
      <Row className="mb-3">
        <Col xs="12" className="text-center">
          <h3 className="text-white fw-bold">Dashboard</h3>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs="12" className="d-flex justify-content-center">
          <Form.Control
            type="text"
            placeholder="Search by LocoNumber or Inspector Name"
            value={searchTerm}
            onChange={handleSearch}
            style={{ maxWidth: "400px", width: "100%" }}
          />
        </Col>
      </Row>

      {!isMobile ? (
        <Row>
          <Col xs="12" style={{ overflowX: "auto" }}>
            <DataTable
              value={filteredData}
              rowkey="record"
              selection={selectedRows}
              onSelectionChange={(e) => setSelectedRows(e.value || [])}
              paginator rows={10} rowsPerPageOptions={[10,25,50]} removableSort
              tableStyle={{ minWidth: "800px" }}
            >
              <Column selectionMode="multiple" style={{ width: "3rem" }} />
              <Column field="record" header="Record" sortable />
              <Column field="locoNumber" header="Loco No." sortable />
              <Column field="dateAssessed" header="Date Assessed" sortable />
              <Column field="timeAssessed" header="Time Assessed" />
              <Column field="inspectorName" header="Inspector Name" />
              <Column field="proMain" header="Program Maintenance" />
              <Column field="bodyDamage" header="Body Damage" />
              <Column field="bodyRepairValue" header="Body Repair Value" />
              <Column field="replaceValue" header="Replace Value" />
              <Column field="refurbishValue" header="Refurbish Value" />
              <Column field="liftingRequired" header="Lifting Required" />
              <Column header="Body Photos" body={bodyPhotosTemplate} />
              <Column header="Lift Photos" body={liftPhotosTemplate} />
              <Column header="Assessment Photos" body={assessmentPhotosTemplate} />
              <Column header="All Photos" body={allPhotosTemplate} />
              <Column header="Certificate" body={certTemplate} />
              <Column field="assessmentResults" header="Results" />
              <Column header="Quote" body={quoteTemplate} />
              <Column field="uploadStatus" header="Upload Status" />
              <Column field="uploadDate" header="Upload Date" />
            </DataTable>
          </Col>
        </Row>
      ) : (
        <Row className="g-3">
          {filteredData.map(row => (
            <Col xs="12" key={row.record}>
              <Card className="shadow-sm rounded-3 hover-shadow" style={{ transition: "0.3s" }}>
                <Card.Body>
                  <Card.Title className="mb-2 fw-bold">{row.locoNumber}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">{row.inspectorName}</Card.Subtitle>
                  <Card.Text className="mb-2" style={{ lineHeight: "1.5" }}>
                    <strong>Date:</strong> {row.dateAssessed}<br/>
                    <strong>Time:</strong> {row.timeAssessed}<br/>
                    <strong>Program Maintenance:</strong> {row.proMain}<br/>
                    <strong>Body Damage:</strong> {row.bodyDamage}<br/>
                    <strong>Body Repair Value:</strong> {row.bodyRepairValue}<br/>
                    <strong>Replace Value:</strong> {row.replaceValue}<br/>
                    <strong>Refurbish Value:</strong> {row.refurbishValue}<br/>
                    <strong>Lifting Required:</strong> {row.liftingRequired}<br/>
                    <strong>Results:</strong> {row.assessmentResults}<br/>
                    <strong>Upload Status:</strong> {row.uploadStatus}<br/>
                    <strong>Upload Date:</strong> {row.uploadDate}<br/>
                  </Card.Text>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {normalizePhotosToArray(row.bodyPhotos).length>0 && <Button size="sm" variant="outline-primary" onClick={()=>openPhotoModal(row.bodyPhotos,"Body Photos")}>Body Photos</Button>}
                    {normalizePhotosToArray(row.liftPhotos).length>0 && <Button size="sm" variant="outline-primary" onClick={()=>openPhotoModal(row.liftPhotos,"Lift Photos")}>Lift Photos</Button>}
                    {normalizePhotosToArray(row.assessmentPhotos).length>0 && <Button size="sm" variant="outline-primary" onClick={()=>openPhotoModal(row.assessmentPhotos,"Assessment Photos")}>Assessment Photos</Button>}
                    {(normalizePhotosToArray(row.bodyPhotos).length>0 || normalizePhotosToArray(row.liftPhotos).length>0 || normalizePhotosToArray(row.assessmentPhotos).length>0) && <Button size="sm" variant="outline-primary" onClick={()=>openPhotoModal([row.bodyPhotos,row.liftPhotos,row.assessmentPhotos].flat(),"All Photos")}>All Photos</Button>}
                    {row.assessmentCert && <Button size="sm" variant="outline-success" onClick={()=>openCertModal(row.assessmentCert,"Certificate")}>View Certificate</Button>}
                    {row.assessmentQuote && <Button size="sm" variant="outline-success" onClick={()=>openQuoteModal(row.assessmentQuote,"Quote")}>View Quote</Button>}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Action buttons */}
      <Row className="mt-3 mb-3">
        <Col xs="12" className="d-flex justify-content-start flex-wrap gap-2">
          <Button variant="primary" onClick={()=>{if(!selectedRows.length){alert("Please select at least one item to upload.");return;}setShowUploadModal(true);}}>Upload</Button>
          <Button variant="success" onClick={()=>{localStorage.removeItem("locoNumber"); window.location.href="/landing";}}>Start New Inspection</Button>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={showPhotoModal} onHide={closePhotoModal} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{modalTitle}</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          {photoList.length === 0 ? <p>No Photos</p> : <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="outline-secondary" onClick={showPrevPhoto}>&larr; Prev</Button>
              <Button variant="outline-secondary" onClick={showNextPhoto}>Next &rarr;</Button>
            </div>
            <Image src={photoList[selectedPhotoIndex]} fluid rounded style={{ maxHeight: "70vh" }} />
          </>}
        </Modal.Body>
      </Modal>

      <Modal show={showCertModal} onHide={closeCertModal} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{certTitle}</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          {certLink ? <iframe src={certLink} width="100%" height="500px" title="Certificate"></iframe> : <p>No Certificate</p>}
        </Modal.Body>
      </Modal>

      <Modal show={showQuoteModal} onHide={closeQuoteModal} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>{quoteTitle}</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          {quoteLink ? <iframe src={quoteLink} width="100%" height="500px" title="Quote"></iframe> : <p>No Quote</p>}
        </Modal.Body>
      </Modal>

      <Modal show={showUploadModal} onHide={()=>setShowUploadModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Upload</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to upload {selectedRows.length} selected items?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowUploadModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUploadSelected}>Upload</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default DashBoardItems;
