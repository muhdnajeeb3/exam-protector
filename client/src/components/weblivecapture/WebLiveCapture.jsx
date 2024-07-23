import { useRef, useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // Import TensorFlow.js
import axios from "axios";
import "./weblivecapture.css";

function WebLiveCapture({ setPeopledetected }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [username, setUsername] = useState("najeeb"); // Replace with the actual username
  const [objectDetector, setObjectDetector] = useState(null);

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
        cocoSsd.load().then(model => setObjectDetector(model)), // Load the object detection model
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
        return;
      }

      const matcher = new faceapi.FaceMatcher(results);
      setFaceMatcher(matcher);
      console.log(
        "FaceMatcher created with descriptors from the reference image."
      );
    } catch (error) {
      console.error("Error creating face matcher:", error);
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

      if (detections.length > 0) {
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

          console.log(`Detected matching face with label: ${label}`);
        });

        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      } else {
        console.log("No faces detected in the video stream.");
      }

      if (objectDetections.length > 0) {
        console.log(`Detected ${objectDetections.length} objects in the video stream.`);

        objectDetections.forEach((detection) => {
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
