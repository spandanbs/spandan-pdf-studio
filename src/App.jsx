import React, { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [mode, setMode] = useState("pdf");
  const [images, setImages] = useState([]);
  const [targetSize, setTargetSize] = useState(200);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(mapped);
    setOriginalSize((files[0].size / 1024).toFixed(2));
    setCompressedSize(null);
  };

  // ---------- PDF ----------
  const generatePDF = async () => {
    if (!images.length) return;

    setLoading(true);
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i].preview;
      await new Promise((r) => (img.onload = r));

      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, width, height);
    }

    pdf.save("spandan-output.pdf");
    setLoading(false);
  };

  // ---------- COMPRESS ----------
  const compressImage = async () => {
    if (!images.length) return;

    setLoading(true);

    const img = new Image();
    img.src = images[0].preview;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let min = 0.1;
    let max = 1;
    let compressedData;
    let compressedKB;

    for (let i = 0; i < 10; i++) {
      const mid = (min + max) / 2;
      compressedData = canvas.toDataURL("image/jpeg", mid);

      const byteString = atob(compressedData.split(",")[1]);
      compressedKB = byteString.length / 1024;

      if (compressedKB > targetSize) {
        max = mid;
      } else {
        min = mid;
      }
    }

    setCompressedSize(compressedKB.toFixed(2));

    const link = document.createElement("a");
    link.href = compressedData;
    link.download = "compressed-image.jpg";
    link.click();

    setLoading(false);
  };

  const theme = {
    bg: dark
      ? "linear-gradient(135deg,#141e30,#243b55)"
      : "linear-gradient(135deg,#f5f7fa,#c3cfe2)",
    card: dark ? "#1f2937" : "#ffffff",
    text: dark ? "#f9fafb" : "#111827",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        transition: "0.4s",
      }}
    >
      <div
        style={{
          background: theme.card,
          color: theme.text,
          padding: "40px",
          borderRadius: "25px",
          width: "100%",
          maxWidth: "800px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          backdropFilter: "blur(20px)",
          transition: "0.4s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ fontWeight: "600" }}>🍎 Spandan Studio</h1>
          <button
            onClick={() => setDark(!dark)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mode Toggle */}
        <div style={{ margin: "25px 0", textAlign: "center" }}>
          <button
            onClick={() => setMode("pdf")}
            style={modeBtn(mode === "pdf")}
          >
            Image → PDF
          </button>

          <button
            onClick={() => setMode("compress")}
            style={modeBtn(mode === "compress")}
          >
            Compress Image
          </button>
        </div>

        {/* Upload */}
        <div style={{ textAlign: "center" }}>
          <input type="file" multiple onChange={handleUpload} />
        </div>

        {/* Preview */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.preview}
              alt=""
              style={{
                width: "100px",
                borderRadius: "12px",
                boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>

        {/* PDF */}
        {mode === "pdf" && images.length > 0 && (
          <center>
            <button style={mainBtn} onClick={generatePDF}>
              {loading ? "Generating..." : "Generate PDF"}
            </button>
          </center>
        )}

        {/* Compress */}
        {mode === "compress" && images.length > 0 && (
          <div style={{ marginTop: "25px", textAlign: "center" }}>
            <p>Original Size: {originalSize} KB</p>

            <label>Target Size (KB)</label>
            <br />
            <input
              type="number"
              value={targetSize}
              onChange={(e) => setTargetSize(Number(e.target.value))}
              style={{
                padding: "8px",
                borderRadius: "8px",
                width: "120px",
                margin: "10px 0",
              }}
            />

            {compressedSize && (
              <p>Compressed Size: {compressedSize} KB</p>
            )}

            <br />
            <button style={mainBtn} onClick={compressImage}>
              {loading ? "Compressing..." : "Download Compressed"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const modeBtn = (active) => ({
  padding: "10px 25px",
  margin: "5px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  background: active ? "#0071e3" : "#e5e7eb",
  color: active ? "white" : "#111",
  fontWeight: "500",
});

const mainBtn = {
  marginTop: "20px",
  padding: "12px 30px",
  borderRadius: "15px",
  border: "none",
  background: "linear-gradient(135deg,#0071e3,#0051a8)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  fontSize: "15px",
};