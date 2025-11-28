import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "react-bootstrap";
import { FaCheckCircle, FaClock, FaListAlt } from "react-icons/fa";
import Loader from "../components/Loader";
// Color Fill (Linked to defs)
const PIE_COLORS = ["url(#pieGreen)", "url(#pieOrange)"];
const BAR_COLORS = {
  inspected: "url(#barGreen)",
  pending: "url(#barOrange)",
};

// Card Colors
const CARD_COLORS = [
  "linear-gradient(135deg, #e8f8f2 0%, #bff0d9 100%)",
  "linear-gradient(135deg, #e8f1ff 0%, #c7dbff 100%)",
  "linear-gradient(135deg, #f5e8ff 0%, #e2c7ff 100%)",
  "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
  "linear-gradient(135deg, #ffe8f1 0%, #ffc7d9 100%)",
  "linear-gradient(135deg, #f2f4f7 0%, #d9dee4 100%)",
];

const InspectionStatus = () => {
  const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try
    {
        setLoading(true);
    const res = await axios.get("Dashboard/GetInspectionStatus");
    setData(res.data);
    }
    catch
    {

    }
    finally
    {
        setLoading(false);
    }
  };

  const totalInspected = data.reduce((a, b) => a + b.inspected, 0);
  const totalPending = data.reduce((a, b) => a + b.pending, 0);

  const donutData = [
    { name: "Inspected", value: totalInspected },
    { name: "Pending", value: totalPending },
  ];

  const donutPercentage = Math.round(
    (totalInspected / (totalInspected + totalPending)) * 100
  );

  return (
    <>
          {loading && <Loader fullscreen />}
    <div className="container mt-3">

      {/* ---------- Cards Section ---------- */}
      <div className="row mb-4">
        {data.map((d, index) => {
          const bg = CARD_COLORS[index % CARD_COLORS.length];

          return (
            <div className="col-md-6 mb-3" key={d.inspectionType}>
              <Card
                className="p-3 shadow-sm card-hover"
                style={{
                  background: bg,
                  borderRadius: 16,
                  border: "none",
                }}
              >
                <h5 className="text-center mb-2 text-dark">
                  <FaListAlt className="me-2 text-primary" />
                  {d.inspectionType}
                </h5>

                <div className="mt-2 text-dark">
                  <div className="d-flex justify-content-between px-2 py-1">
                    <span>Total Assets</span>
                    <strong>{d.total}</strong>
                  </div>

                  <div className="d-flex justify-content-between px-2 py-1">
                    <span className="text-success">
                      <FaCheckCircle className="me-1" />
                      Inspected
                    </span>
                    <strong className="text-success">{d.inspected}</strong>
                  </div>

                  <div className="d-flex justify-content-between px-2 py-1">
                    <span className="text-danger">
                      <FaClock className="me-1" />
                      Pending
                    </span>
                    <strong className="text-danger">{d.pending}</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress mt-3" style={{ height: 16 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${d.completionPercent}%`,
                      background: "linear-gradient(90deg, #2ecc71, #27ae60)",
                    }}
                  >
                    {d.completionPercent}%
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* ---------- CHARTS SECTION ---------- */}
      <div className="row mt-4">

        {/* -------- Donut Chart -------- */}
        <div className="col-md-6 d-flex justify-content-center mb-4">
          <PieChart width={300} height={300}>
            <defs>
              {/* Unique IDs for PIE (fixes overwrite issue) */}
              <linearGradient id="pieGreen">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#27ae60" />
              </linearGradient>

              <linearGradient id="pieOrange">
                <stop offset="0%" stopColor="#ff7043" />
                <stop offset="100%" stopColor="#ff5722" />
              </linearGradient>
            </defs>

            <Pie
              data={donutData}
              innerRadius={60}
              outerRadius={95}
              dataKey="value"
            >
              {donutData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index]} />
              ))}
            </Pie>

            <Tooltip contentStyle={{ background: "#222", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff" }} />
          </PieChart>

          {/* Center Text */}
          <div
            style={{
              position: "absolute",
              fontSize: 28,
              fontWeight: "bold",
              color: "#fff",
              transform: "translate(-50%, 110px)",
            }}
          >
            {donutPercentage}%
          </div>
        </div>

        {/* -------- Bar Chart -------- */}
        <div className="col-md-6 d-flex justify-content-center mb-4">
          <BarChart width={380} height={260} data={data}>
            <defs>
              {/* Unique IDs for BAR */}
              <linearGradient id="barGreen">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#27ae60" />
              </linearGradient>

              <linearGradient id="barOrange">
                <stop offset="0%" stopColor="#ff7043" />
                <stop offset="100%" stopColor="#ff5722" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#88a" />
            <XAxis dataKey="inspectionType" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ background: "#222", color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#fff" }} />

            {/* Bar Shadows */}
            <Bar
              dataKey="inspected"
              stackId="a"
              fill={BAR_COLORS.inspected}
              style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))" }}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill={BAR_COLORS.pending}
              style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))" }}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </div>
      </div>

      <style>{`
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
    </>
  );
};

export default InspectionStatus;
