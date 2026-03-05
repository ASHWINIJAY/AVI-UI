import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../components/InspectionDetails.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";

const InspectionDetails = () => {
  const { locoNumber } = useParams();
  const BACKEND_URL = "https://avi-app.co.za/AVIapi";
  const [tables, setTables] = useState([]);
  const [capture, setCapture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      axios.get(`inspectiondetails/details/${locoNumber}`),
      axios.get(`inspectiondetails/capture/${locoNumber}`)
    ])
      .then(([detailsRes, captureRes]) => {
        setTables(detailsRes.data);
        setCapture(captureRes.data);
      })
      .finally(() => setLoading(false));
  }, [locoNumber]);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    tables.forEach(table => {
      const data = [
        ["SNO", "Part Description", "Good", "Refurbish", "Missing", "Replace", "Labour"],
        ...table.rows.map(r => [
          r.sno,
          r.partDes,
          r.good,
          r.refurbish,
          r.missing,
          r.replace,
          r.labour
        ]),
        [
          "TOTAL",
          "",
          table.total.good,
          table.total.refurbish,
          table.total.missing,
          table.total.replace,
          table.total.labour
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, table.tableName.substring(0, 31));
    });

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `${locoNumber}_Inspection.xlsx`);
  };

  if (loading) return <p>Loading inspection details...</p>;

  return (
    <div className="inspection-page">

      {/* -------- Header -------- */}
      <div className="page-header">
        <h2>Inspection Details – {locoNumber}</h2>
        <button className="export-btn" onClick={exportExcel}>
          Export to Excel
        </button>
      </div>

      {/* -------- Capture Records -------- */}
      {capture && (
        <div className="capture-card">
          <div className="capture-title">
            Capture Records
          </div>

          <div className="capture-grid">

            <div>
              <label>Loco Number</label>
              <p>{capture.locoNumber}</p>
            </div>

            <div>
              <label>Inventory Number</label>
              <p>{capture.inventoryNumber}</p>
            </div>

            <div>
              <label>Net Book Value</label>
              <p>{capture.netBookValue}</p>
            </div>

            <div>
              <label>Loco Class</label>
              <p>{capture.locoClass}</p>
            </div>

            <div>
              <label>Loco Model</label>
              <p>{capture.locoModel}</p>
            </div>

            <div>
              <label>GPS Location</label>
              <p>
                {capture.gpsLatitude}, {capture.gpsLongitude}
              </p>
            </div>

            <div>
              <label>Lift Date</label>
              <p>{capture.liftDate}</p>
            </div>

            <div>
              <label>Phase</label>
              <p>{capture.phase}</p>
            </div>

          </div>

          {/* -------- Photos -------- */}
          <div className="photo-row">
            {capture.locoPhoto && (
              <img
                src={`${BACKEND_URL}/${capture.locoPhoto}`}
                alt="Loco"
                className="capture-img"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}

            {capture.liftPhoto && (
              <img
                src={`${BACKEND_URL}/${capture.liftPhoto}`}
                alt="Lift"
                className="capture-img"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
          </div>

        </div>
      )}

      {/* -------- Inspection Tables -------- */}
      {tables.map((table, index) => (
        <div key={index} className="inspect-card">
          <div className="inspect-title">{table.tableName}</div>

          <div className="table-scroll">
            <table className="inspection-table">
              <thead>
                <tr>
                  <th>SNO</th>
                  <th>Part Description</th>
                  <th>Good</th>
                  <th>Refurbish</th>
                  <th>Missing</th>
                  <th>Replace</th>
                  <th>Labour</th>
                </tr>
              </thead>

              <tbody>
                {table.rows.map(row => (
                  <tr key={row.sno}>
                    <td>{row.sno}</td>
                    <td>{row.partDes}</td>
                    <td>{row.good}</td>
                    <td>{row.refurbish}</td>
                    <td>{row.missing}</td>
                    <td>{row.replace}</td>
                    <td>{row.labour}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="2">TOTAL</td>
                  <td>{table.total.good}</td>
                  <td>{table.total.refurbish}</td>
                  <td>{table.total.missing}</td>
                  <td>{table.total.replace}</td>
                  <td>{table.total.labour}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InspectionDetails;