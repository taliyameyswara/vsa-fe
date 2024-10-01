import { useState } from "react";
import axios from "axios";

const FaceDetection = () => {
  const [image, setImage] = useState(null);
  const [detections, setDetections] = useState([]);
  const [imageURL, setImageURL] = useState("");
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImageURL(URL.createObjectURL(file));

    if (!file) {
      console.error("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

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
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const maxImageWidth = 500;

  const scale =
    imageDimensions.width > maxImageWidth
      ? maxImageWidth / imageDimensions.width
      : 1;

  return (
    <div>
      <h1>Face Detection</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {imageURL && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={imageURL}
            alt="uploaded"
            style={{ maxWidth: `${maxImageWidth}px`, height: "auto" }}
            onLoad={handleImageLoad}
          />
          {detections.map((det, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceDetection;
