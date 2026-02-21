import React, { useState } from "react";
import jsPDF from "jspdf";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [darkMode, setDarkMode] = useState(false);

  const onDrop = (acceptedFiles) => {
    const mapped = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;

    setLoading(true);

    const pdf = new jsPDF({
      format: pageSize,
    });

    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i].preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = (img.height * width) / img.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, width, height);
    }

    pdf.save("converted.pdf");
    setLoading(false);
  };

  const theme = {
    background: darkMode
      ? "linear-gradient(135deg, #1e1e1e, #2c2c2c)"
      : "linear-gradient(135deg, #f5f5f7, #e5e5ea)",
    card: darkMode ? "#2c2c2e" : "#ffffff",
    text: darkMode ? "white" : "black",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: theme.card,
          color: theme.text,
          padding: "40px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "800px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h1
  style={{
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  }}
>
  🍎 Spandan PDF Studio
</h1>

<p
  style={{
    textAlign: "center",
    opacity: 0.6,
    marginBottom: "25px",
  }}
>
  Convert images into elegant PDFs instantly.
</p>

        {/* Dark Mode Toggle */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Page Size Selector */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            style={{ padding: "8px", borderRadius: "8px" }}
          >
            <option value="a4">A4</option>
            <option value="a3">A3</option>
          </select>
        </div>

        {/* Drag & Drop */}
        <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.02 }}
          style={{
            border: "2px dashed #999",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <input {...getInputProps()} />
          <p>Drag & Drop Images or Click to Upload</p>
        </motion.div>

        {/* Image Preview */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            justifyContent: "center",
          }}
        >
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: "relative",
              }}
            >
              <img
                src={img.preview}
                alt="preview"
                width="120"
                style={{ borderRadius: "12px" }}
              />
              <button
                onClick={() => removeImage(index)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>

        {/* Generate Button */}
        {images.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={generatePDF}
              style={{
                padding: "12px 30px",
                borderRadius: "12px",
                border: "none",
                background: "#0071e3",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate PDF"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}