import { ImageResponse } from "next/og";

export const alt = "DUTI — Pedí, pagá y retirá a horario";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #15304f 0%, #1e3d63 100%)",
          color: "#faf8f5",
        }}
      >
        {/* Reloj de marca */}
        <div
          style={{
            position: "relative",
            width: 200,
            height: 200,
            borderRadius: 200,
            border: "12px solid #faf8f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* aguja vertical (cobre) */}
          <div style={{ position: "absolute", width: 9, height: 78, background: "#d99a72", borderRadius: 9, top: 26, left: 95 }} />
          {/* aguja diagonal (cobre) */}
          <div style={{ position: "absolute", width: 9, height: 64, background: "#d99a72", borderRadius: 9, top: 96, left: 95, transform: "rotate(125deg)", transformOrigin: "top center" }} />
          {/* centro */}
          <div style={{ position: "absolute", width: 22, height: 22, borderRadius: 22, background: "#bd7b54", top: 89, left: 89 }} />
        </div>

        <div style={{ marginTop: 44, fontSize: 110, fontWeight: 800, letterSpacing: 14 }}>DUTI</div>
        <div style={{ marginTop: 8, fontSize: 34, color: "rgba(250,244,236,0.75)" }}>
          Pedí, pagá y retirá a horario
        </div>
      </div>
    ),
    { ...size }
  );
}
