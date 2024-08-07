import { useRef, useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // Import TensorFlow.js
import axios from "axios";
import "./weblivecapture.css";
import Loading from "../Loading/Loading";
import { format } from 'date-fns';


const resizeAndCompressImage = (base64Str, maxWidth, maxHeight, quality) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const newBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(newBase64);
    };
  });
};

const getBase64Size = (base64Str) => {
  const base64String = base64Str.split(",")[1];
  const stringLength = base64String.length;
  return (stringLength * (3 / 4) - 2) / 1000; // Size in KB
};


function WebLiveCapture({ setPeopledetected,warningdetected }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [username, setUsername] = useState("najeeb"); // Replace with the actual username
  const [objectDetector, setObjectDetector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startVideo();
    loadModels();
  }, []);

  const userregisteredimage = localStorage.getItem("user_profile_picture");
  const userregisteredname = localStorage.getItem("user_name");

  useEffect(() => {
    setUsername(userregisteredname);
  }, [userregisteredname]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        videoRef.current.onloadedmetadata = () => {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        };
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        cocoSsd.load().then((model) => setObjectDetector(model)), // Load the object detection model
      ]);
      console.log("Models loaded successfully.");
      await createFaceMatcher();
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const createFaceMatcher = async () => {
    try {
      const referenceImage = await faceapi.fetchImage(userregisteredimage);
      const results = await faceapi
        .detectAllFaces(referenceImage, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!results.length) {
        console.log("No faces detected in the reference image.");
        setLoading(false);
        return;
      }

      const matcher = new faceapi.FaceMatcher(results);
      setFaceMatcher(matcher);
      console.log(
        "FaceMatcher created with descriptors from the reference image."
      );
      setLoading(false);
    } catch (error) {
      console.error("Error creating face matcher:", error);
      setLoading(false);
    }
  };

  const captureImage = async() => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const originalImage = canvas.toDataURL("image/png");

    // Resize and compress the image
    const compressedImage = await resizeAndCompressImage(originalImage, 800, 800, 0.7);
    console.log(`Original Size: ${getBase64Size(originalImage).toFixed(2)} KB`);
    console.log(`Compressed Size: ${getBase64Size(compressedImage).toFixed(2)} KB`);
    return compressedImage;
  };

  const sendScreenshot = async (screenshot, message, timestamp) => {
    if (!screenshot) {
      console.log('No screenshot captured');
      return;
    }

    try {
      const response = await axios.post(
        `/api/test/screenshot/${localStorage.getItem('test_code')}/${localStorage.getItem('user_id')}`,
        { 
          screenshot: screenshot, 
          message: message, 
          timestamp: timestamp 
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}` // Ensure to include the token
          }
        }
      );

      if (response.status === 200) {
        console.log('Screenshot uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload screenshot', error);
    }
  }; 

  const detectFacesAndObjects = async () => {
    if (!faceMatcher || !objectDetector) {
      console.log("FaceMatcher or object detector not yet initialized.");
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      const objectDetections = await objectDetector.detect(videoRef.current);

      // Clear the canvas before drawing new boxes
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      setPeopledetected(detections?.length);

      let maliciousActivityDetected = false;
      let message = '';

      if (detections.length !== 1) {
        console.log("Malicious activity detected: Number of faces is not equal to 1.");
        maliciousActivityDetected = true;
        message = 'Number of faces is not equal to 1';
      } else {
        console.log(`Detected ${detections.length} faces in the video stream.`);

        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });

        resizedDetections.forEach((detection) => {
          const box = detection.detection.box;
          const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
          const label = bestMatch.label === "unknown" ? "Unknown" : username;
          const drawBox = new faceapi.draw.DrawBox(box, { label });
          drawBox.draw(canvas);

          if (label === "Unknown") {
            console.log("Malicious activity detected: Face is unknown.");
            maliciousActivityDetected = true;
            message = 'Face is unknown';
          }

          console.log(`Detected matching face with label: ${label}`);
        });

        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }

      objectDetections.forEach((detection) => {
        if (detection.class === "person" && detections.length !== 1) {
          console.log("Malicious activity detected: Multiple persons detected.");
          maliciousActivityDetected = true;
          message = 'Multiple persons detected';
        }
        if (["cell phone", "mobile phone", "tablet"].includes(detection.class)) {
          console.log("Malicious activity detected: Mobile or tablet detected.");
          maliciousActivityDetected = true;
          message = 'Mobile or tablet detected';
        }

        const [x, y, width, height] = detection.bbox;
        context.strokeStyle = "#00FF00";
        context.lineWidth = 2;
        context.strokeRect(x, y, width, height);
        context.font = "18px Arial";
        context.fillStyle = "#00FF00";
        context.fillText(
          `${detection.class} (${Math.round(detection.score * 100)}%)`,
          x,
          y > 10 ? y - 5 : 10
        );
      });

      if (maliciousActivityDetected) {
        const screenshot =await captureImage();
        const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        await sendScreenshot(screenshot, message, timestamp);
        warningdetected();
      }
    } catch (error) {
      console.error("Error detecting faces and objects in video stream:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(detectFacesAndObjects, 1000); // Detect faces and objects every second
    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [faceMatcher, objectDetector]);

  return (
    <>
      {loading && <Loading message="Knowledge is power, and it's on its way..."/>}
      <div className="appvide">
        <video
          crossOrigin="anonymous"
          height={150}
          width={300}
          ref={videoRef}
          autoPlay
        ></video>
      </div>
      <canvas ref={canvasRef} height={150} width={300} className="appcanvas" />
    </>
  );
}

export default WebLiveCapture;
