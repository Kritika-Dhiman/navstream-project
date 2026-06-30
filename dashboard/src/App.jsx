import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const theme = {
  light: {
    page:   "#f5f5f3",
    card:   "#ffffff",
    border: "rgba(0,0,0,0.08)",
    title:  "#0b0b0b",
    sub:    "#898781",
    muted:  "#52514e",
    grid:   "#e8e8e6",
    tick:   "#898781",
  },
  dark: {
    page:   "#0f0f0e",
    card:   "#1a1a19",
    border: "rgba(255,255,255,0.08)",
    title:  "#ffffff",
    sub:    "#898781",
    muted:  "#c3c2b7",
    grid:   "#2c2c2a",
    tick:   "#898781",
  }
};

function MetricCard({ label, value, unit, deltaEl, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: t.card,
        border: `0.5px solid ${t.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,0.12)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 12, color: t.sub, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: t.title }}>
        {value}<span style={{ fontSize: 13, color: t.muted, fontWeight: 400 }}> {unit}</span>
      </div>
      <div style={{ marginTop: 4, minHeight: 16 }}>{deltaEl}</div>
    </div>
  );
}

function ChartCard({ title, children, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: t.card,
        border: `0.5px solid ${t.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 20px rgba(0,0,0,0.12)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: t.muted, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [telemetry, setTelemetry] = useState({});
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const prevRef = useRef({});
  const lastPrediction = useRef(null);
  const sampleRef = useRef(0);

  const t = dark ? theme.dark : theme.light;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/telemetry");
        const data = res.data;

        const old = prevRef.current;
        prevRef.current = data;
        setTelemetry(data);

        sampleRef.current += 1;
        setChartData(prev => {
          const next = [...prev, {
            sample: sampleRef.current,
            voltage:     data.voltage     ? +parseFloat(data.voltage).toFixed(2)     : null,
            current:     data.current     ? +parseFloat(data.current).toFixed(2)     : null,
            temperature: data.temperature ? +parseFloat(data.temperature).toFixed(1) : null,
          }];
          return next.length > 30 ? next.slice(-30) : next;
        });

        const isAnomaly = data.prediction === 1;
        if (lastPrediction.current !== data.prediction) {
          setAlerts(prev => [{
            ts: Date.now(),
            isAnomaly,
            voltage:     data.voltage,
            temperature: data.temperature,
          }, ...prev].slice(0, 20));
          lastPrediction.current = data.prediction;
        }

      } catch (err) {
        console.error("API fetch failed:", err.message);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAnomaly = telemetry.prediction === 1;
  const prev = prevRef.current;

  function delta(curr, prevVal, unit) {
    if (prevVal === undefined || curr === undefined || prevVal === curr) return null;
    const diff = (parseFloat(curr) - parseFloat(prevVal)).toFixed(2);
    const up = diff > 0;
    return (
      <span style={{ fontSize: 11, color: up ? "#3b6d11" : "#a32d2d" }}>
        {up ? "▲ +" : "▼ "}{diff} {unit}
      </span>
    );
  }

  function normalizeSOH(val) {
    if (val === undefined) return "—";
    const n = parseFloat(val);
    return (n < 2 ? n * 100 : n).toFixed(1);
  }

  const fmt = (val, decimals = 2) =>
    val !== undefined ? parseFloat(val).toFixed(decimals) : "—";

  const lastUpdated = telemetry.timestamp
    ? new Date(telemetry.timestamp).toLocaleTimeString()
    : "—";

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", background: t.page, minHeight: "100vh", color: t.title, transition: "background 0.3s, color 0.3s" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#0ca30c", marginTop: 6,
            boxShadow: "0 0 0 3px rgba(12,163,12,0.2)",
          }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: t.title }}>Battery Monitoring Dashboard</div>
            <div style={{ fontSize: 12, color: t.sub, marginTop: 4, lineHeight: 1.8 }}>
              Battery ID : BAT-001 &nbsp;·&nbsp; Model : Random Forest (ONNX) &nbsp;·&nbsp; Status : Live
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              style={{
                background: t.card,
                border: `0.5px solid ${t.border}`,
                color: t.title,
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {dark ? "☀ Light" : "🌙 Dark"}
            </button>

            {/* status badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              background: isAnomaly ? "#fcebeb" : "#eaf3de",
              color:      isAnomaly ? "#501313"  : "#27500a",
              border:     `0.5px solid ${isAnomaly ? "#f09595" : "#c0dd97"}`,
            }}>
              {isAnomaly ? "🔴 ANOMALY DETECTED" : "🟢 HEALTHY"}
            </div>
          </div>

          {/* last updated */}
          <div style={{ fontSize: 12, color: t.sub, textAlign: "right" }}>
            Last updated<br />
            <span style={{ fontWeight: 500, color: t.muted }}>{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MetricCard t={t} label="Voltage"      value={fmt(telemetry.voltage)}        unit="V"  deltaEl={delta(telemetry.voltage,     prev.voltage,     "V")} />
        <MetricCard t={t} label="Current"      value={fmt(telemetry.current)}        unit="A"  deltaEl={delta(telemetry.current,     prev.current,     "A")} />
        <MetricCard t={t} label="Temperature"  value={fmt(telemetry.temperature, 1)} unit="°C" deltaEl={delta(telemetry.temperature, prev.temperature, "°C")} />
        <MetricCard t={t} label="SOC"          value={fmt(telemetry.soc)}            unit="%"  deltaEl={delta(telemetry.soc,         prev.soc,         "%")} />
        <MetricCard t={t} label="Health Index" value={normalizeSOH(telemetry.soh)}   unit="%"  deltaEl={null} />
        <MetricCard t={t} label="Power"        value={fmt(telemetry.power, 0)}       unit="W"  deltaEl={delta(telemetry.power,       prev.power,       "W")} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <ChartCard title="Voltage over time" t={t}>
          <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#2a78d6", display: "inline-block" }} />Voltage (V)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="sample" tick={{ fontSize: 10, fill: t.tick }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: t.tick }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 12, background: t.card, border: `1px solid ${t.border}`, color: t.title }} />
              <Line type="monotone" dataKey="voltage" stroke="#2a78d6" strokeWidth={2} dot={false} name="Voltage (V)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Current over time" t={t}>
          <div style={{ display: "flex", gap: 14, marginBottom: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: t.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#1baf7a", display: "inline-block" }} />Current (A)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
              <XAxis dataKey="sample" tick={{ fontSize: 10, fill: t.tick }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: t.tick }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ fontSize: 12, background: t.card, border: `1px solid ${t.border}`, color: t.title }} />
              <Line type="monotone" dataKey="current" stroke="#1baf7a" strokeWidth={2} dot={false} name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Alert History */}
      <div style={{ background: t.card, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.muted }}>Alert history</div>
          <span style={{ fontSize: 12, color: t.sub }}>{alerts.length} events</span>
        </div>
        {alerts.length === 0 && (
          <div style={{ fontSize: 13, color: t.sub, padding: "8px 0" }}>No status changes yet — waiting for data...</div>
        )}
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0",
            borderBottom: i < alerts.length - 1 ? `0.5px solid ${t.border}` : "none"
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: a.isAnomaly ? "#e24b4a" : "#0ca30c" }} />
            <span style={{ fontSize: 12, color: t.sub, minWidth: 80, fontVariantNumeric: "tabular-nums" }}>
              {new Date(a.ts).toLocaleTimeString()}
            </span>
            <span style={{ fontSize: 13, flex: 1, color: t.title }}>
              {a.isAnomaly
                ? `Anomaly detected — V: ${parseFloat(a.voltage).toFixed(1)} V  ·  T: ${parseFloat(a.temperature).toFixed(1)} °C`
                : "Status returned to normal"}
            </span>
            <span style={{
              fontSize: 11, padding: "2px 10px", borderRadius: 10,
              background: a.isAnomaly ? "#fcebeb" : "#eaf3de",
              color:      a.isAnomaly ? "#791f1f"  : "#27500a",
              border:     `0.5px solid ${a.isAnomaly ? "#f09595" : "#c0dd97"}`,
            }}>
              {a.isAnomaly ? "Anomaly" : "Normal"}
            </span>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}