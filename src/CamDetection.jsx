import { useState, useEffect, useRef } from "react";
import axios from "axios";

const CamDetection = () => {
  const [detections, setDetections] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const getVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    getVideo();

    const intervalId = setInterval(() => {
      captureImage();
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      setImageDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("file", blob, "webcam_frame.jpg");

          try {
            const response = await axios.post(
              "http://127.0.0.1:8000/detect/",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            setDetections(response.data.detections);
          } catch (error) {
            console.error(
              "Error detecting faces:",
              error.response ? error.response.data : error.message
            );
          }
        }
      }, "image/jpeg");
    }
  };

  return (
    <div>
      <h1>Face Detection (Webcam)</h1>
      {/* Video element untuk menampilkan umpan dari webcam */}
      <video ref={videoRef} autoPlay muted style={{ width: "500px" }} />

      {/* Canvas element untuk menangkap frame dari video */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Menampilkan hasil deteksi wajah */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ maxWidth: "500px", height: "auto", position: "relative" }}
        />
        {detections.map((det, index) => {
          const scale = 500 / imageDimensions.width;
          return (
            <div key={index}>
              <div
                style={{
                  position: "absolute",
                  border: "2px solid red",
                  left: `${det.x1 * scale}px`,
                  top: `${det.y1 * scale}px`,
                  width: `${(det.x2 - det.x1) * scale}px`,
                  height: `${(det.y2 - det.y1) * scale}px`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    padding: "2px 3px",
                    top: "-50px",
                    left: "0px",
                    fontSize: "10px",
                  }}
                >
                  <p>Confidence: {det.confidence.toFixed(2)}</p>
                  <p>Class ID: {det.class_id}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CamDetection;
