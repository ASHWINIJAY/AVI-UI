import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../components/InspectionDetails.css"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";

const InspectionDetails = () => {
  const { locoNumber } = useParams();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`inspectiondetails/details/${locoNumber}`)
      .then(res => setTables(res.data))
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
  <div className="page-header">
    <h2>Inspection Details – {locoNumber}</h2>
    <button className="export-btn" onClick={exportExcel}>
      Export to Excel
    </button>
  </div>

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
