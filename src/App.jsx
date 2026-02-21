import React, { useState } from "react";
import jsPDF from "jspdf";

export default function App() {
  const [mode, setMode] = useState("pdf");
  const [images, setImages] = useState([]);
  const [quality, setQuality] = useState(0.6);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);

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

  // IMAGE TO PDF
  const generatePDF = async () => {
    if (images.length === 0) return;

    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i].preview;

      await new Promise((resolve) => (img.onload = resolve));

      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, width, height);
    }

    pdf.save("spandan-output.pdf");
  };

  // IMAGE COMPRESS
  const compressImage = async () => {
    if (images.length === 0) return;

    const img = new Image();
    img.src = images[0].preview;

    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const compressedData = canvas.toDataURL("image/jpeg", quality);

    const byteString = atob(compressedData.split(",")[1]);
    const compressedKB = (byteString.length / 1024).toFixed(2);
    setCompressedSize(compressedKB);

    const link = document.createElement("a");
    link.href = compressedData;
    link.download = "compressed-image.jpg";
    link.click();
  };

  return (
    <div style={styles.background}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍎 Spandan Studio</h1>

        {/* MODE SWITCH */}
        <div style={styles.toggle}>
          <button
            style={mode === "pdf" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("pdf")}
          >
            Image → PDF
          </button>

          <button
            style={mode === "compress" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("compress")}
          >
            Compress Image
          </button>
        </div>

        <input type="file" multiple onChange={handleUpload} />

        {/* PREVIEW */}
        <div style={styles.preview}>
          {images.map((img, index) => (
            <img key={index} src={img.preview} alt="preview" style={styles.image} />
          ))}
        </div>

        {/* PDF BUTTON */}
        {mode === "pdf" && images.length > 0 && (
          <button style={styles.mainBtn} onClick={generatePDF}>
            Generate PDF
          </button>
        )}

        {/* COMPRESS SECTION */}
        {mode === "compress" && images.length > 0 && (
          <>
            <div style={{ marginTop: "15px" }}>
              <label>Compression Quality: {quality}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </div>

            <div style={{ marginTop: "10px" }}>
              <p>Original Size: {originalSize} KB</p>
              {compressedSize && (
                <p>Compressed Size: {compressedSize} KB</p>
              )}
            </div>

            <button style={styles.mainBtn} onClick={compressImage}>
              Download Compressed Image
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  background: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f5f7, #e5e5ea)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "700px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  toggle: {
    marginBottom: "20px",
  },
  btn: {
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#f5f5f7",
    cursor: "pointer",
  },
  activeBtn: {
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "8px",
    border: "none",
    background: "#0071e3",
    color: "white",
    cursor: "pointer",
  },
  preview: {
    marginTop: "20px",
  },
  image: {
    maxWidth: "120px",
    margin: "10px",
    borderRadius: "10px",
  },
  mainBtn: {
    marginTop: "20px",
    padding: "12px 25px",
    borderRadius: "10px",
    border: "none",
    background: "#0071e3",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};