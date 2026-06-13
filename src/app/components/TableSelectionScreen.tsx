import { useState } from "react";

interface Table {
  id: number;
  number: number;
  seats: number;
  shape: "square" | "circle";
  occupied: boolean;
  x: number;
  y: number;
}

const mainFloorTables: Table[] = [
  { id: 1, number: 1, seats: 2, shape: "circle", occupied: false, x: 1, y: 1 },
  { id: 2, number: 2, seats: 4, shape: "square", occupied: true, x: 3, y: 1 },
  { id: 3, number: 3, seats: 2, shape: "circle", occupied: false, x: 5, y: 1 },
  { id: 4, number: 4, seats: 6, shape: "square", occupied: true, x: 7, y: 1 },
  { id: 5, number: 5, seats: 4, shape: "square", occupied: false, x: 1, y: 3 },
  { id: 6, number: 6, seats: 2, shape: "circle", occupied: true, x: 3, y: 3 },
  { id: 7, number: 7, seats: 4, shape: "square", occupied: false, x: 5, y: 3 },
  { id: 8, number: 8, seats: 2, shape: "circle", occupied: true, x: 7, y: 3 },
  { id: 9, number: 9, seats: 6, shape: "square", occupied: false, x: 1, y: 5 },
  { id: 10, number: 10, seats: 4, shape: "square", occupied: false, x: 3, y: 5 },
  { id: 11, number: 11, seats: 2, shape: "circle", occupied: true, x: 5, y: 5 },
  { id: 12, number: 12, seats: 4, shape: "square", occupied: false, x: 7, y: 5 },
];

const rooftopTables: Table[] = [
  { id: 13, number: 13, seats: 2, shape: "circle", occupied: false, x: 2, y: 1 },
  { id: 14, number: 14, seats: 4, shape: "square", occupied: true, x: 4, y: 1 },
  { id: 15, number: 15, seats: 2, shape: "circle", occupied: false, x: 6, y: 1 },
  { id: 16, number: 16, seats: 4, shape: "square", occupied: false, x: 2, y: 3 },
  { id: 17, number: 17, seats: 6, shape: "square", occupied: true, x: 4, y: 3 },
  { id: 18, number: 18, seats: 2, shape: "circle", occupied: false, x: 6, y: 3 },
  { id: 19, number: 19, seats: 4, shape: "square", occupied: false, x: 2, y: 5 },
  { id: 20, number: 20, seats: 2, shape: "circle", occupied: true, x: 4, y: 5 },
];

interface Props {
  onSelectTable: (tableNumber: number) => void;
  onClose: () => void;
}

export function TableSelectionScreen({ onSelectTable, onClose }: Props) {
  const [activeFloor, setActiveFloor] = useState<"main" | "rooftop">("main");
  const tables = activeFloor === "main" ? mainFloorTables : rooftopTables;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(44,26,17,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "#FDFBF7",
          width: "760px",
          maxHeight: "600px",
          boxShadow: "0 32px 80px rgba(44,26,17,0.22)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 pt-8 pb-6"
          style={{ borderBottom: "1px solid rgba(44,26,17,0.08)" }}
        >
          <div>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#C4622D",
                marginBottom: "4px",
              }}
            >
              Select Table
            </p>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "26px",
                color: "#2C1A11",
                lineHeight: 1.15,
              }}
            >
              Floor Plan
            </h2>
          </div>

          {/* Floor tabs */}
          <div className="flex gap-2">
            {(["main", "rooftop"] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className="px-5 py-2 rounded-full transition-all duration-150"
                style={{
                  background: activeFloor === floor ? "#2C1A11" : "#EDE5DB",
                  color: activeFloor === floor ? "#FDFBF7" : "#7A5C48",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {floor === "main" ? "Main Floor" : "Rooftop"}
              </button>
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{ background: "#EDE5DB", border: "none", cursor: "pointer", color: "#7A5C48", fontSize: "18px" }}
          >
            ×
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 px-8 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: "#C4622D" }} />
            <span style={{ fontSize: "12px", color: "#7A5C48", fontFamily: "'DM Mono', monospace" }}>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: "#FDFBF7", border: "1.5px solid #2C1A11" }} />
            <span style={{ fontSize: "12px", color: "#7A5C48", fontFamily: "'DM Mono', monospace" }}>Available</span>
          </div>
        </div>

        {/* Table grid */}
        <div className="px-8 pb-8 pt-4" style={{ overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gridTemplateRows: "repeat(6, 72px)",
              gap: "8px",
              minHeight: "300px",
            }}
          >
            {tables.map((table) => {
              const colStart = table.x;
              const rowStart = table.y;
              return (
                <button
                  key={table.id}
                  onClick={() => !table.occupied && onSelectTable(table.number)}
                  className="flex flex-col items-center justify-center gap-1 transition-all duration-150"
                  style={{
                    gridColumn: `${colStart} / span 1`,
                    gridRow: `${rowStart} / span 1`,
                    borderRadius: table.shape === "circle" ? "50%" : "12px",
                    background: table.occupied ? "#C4622D" : "#FDFBF7",
                    border: table.occupied ? "none" : "1.5px solid #2C1A11",
                    color: table.occupied ? "#FDFBF7" : "#2C1A11",
                    cursor: table.occupied ? "not-allowed" : "pointer",
                    opacity: table.occupied ? 0.95 : 1,
                    transform: "scale(1)",
                    boxShadow: table.occupied
                      ? "0 2px 12px rgba(196,98,45,0.25)"
                      : "0 1px 4px rgba(44,26,17,0.06)",
                    padding: "4px",
                    width: "72px",
                    height: "72px",
                  }}
                  onMouseEnter={(e) => {
                    if (!table.occupied) {
                      (e.currentTarget as HTMLElement).style.background = "#F0E8DF";
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!table.occupied) {
                      (e.currentTarget as HTMLElement).style.background = "#FDFBF7";
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    }
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1 }}>{table.number}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      opacity: 0.7,
                      fontFamily: "'DM Mono', monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <span>👤</span>
                    {table.seats}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
