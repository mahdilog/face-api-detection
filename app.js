const video = document.getElementById("video");
const videoContainer = document.getElementById("video-container");
const MODEL_URI = "/models";
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URI),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URI),
  faceapi.nets.ageGenderNet.loadFromUri(MODEL_URI),
])
  .then(playVideo)
  .catch((err) => {
    console.log(err);
  });

function playVideo() {
  if (!navigator.mediaDevices) {
    console.error("mediaDevices not supported");
    return;
  }
  navigator.mediaDevices
    .getUserMedia({
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 360, ideal: 720, max: 1080 },
      },
      audio: false,
    })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err) {
      console.log(err);
    });
}
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);

  canvas.willReadFrequently = true;
  videoContainer.appendChild(canvas);

  const canvasSize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, canvasSize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const DetectionsArray = faceapi.resizeResults(detections, canvasSize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    detectionsDraw(canvas, DetectionsArray);
  }, 10);
});

const rightEyebrowImage = new Image();
rightEyebrowImage.src = "./assets/eyebrow1/eyebrow.png";

const leftEyebrowImage = new Image();
leftEyebrowImage.src = "./assets/eyebrow1/eyebroww.png";

function detectionsDraw(canvas, DetectionsArray) {
  const leftEyebrow = DetectionsArray[0].landmarks.getLeftEyeBrow();
  const rightEyebrow = DetectionsArray[0].landmarks.getRightEyeBrow();

  const leftEyebrowBounds = getLandmarkBounds(leftEyebrow);
  canvas
    .getContext("2d")
    .drawImage(
      leftEyebrowImage,
      leftEyebrowBounds.x,
      leftEyebrowBounds.y,
      leftEyebrowBounds.width,
      leftEyebrowBounds.height
    );

  const rightEyebrowBounds = getLandmarkBounds(rightEyebrow);
  canvas
    .getContext("2d")
    .drawImage(
      rightEyebrowImage,
      rightEyebrowBounds.x,
      rightEyebrowBounds.y,
      rightEyebrowBounds.width,
      rightEyebrowBounds.height
    );
}

function getLandmarkBounds(landmarkPoints) {
  const minX = landmarkPoints.reduce(
    (min, p) => (p.x < min ? p.x : min),
    landmarkPoints[0].x
  );
  const minY = landmarkPoints.reduce(
    (min, p) => (p.y < min ? p.y : min),
    landmarkPoints[0].y
  );
  const maxX = landmarkPoints.reduce(
    (max, p) => (p.x > max ? p.x : max),
    landmarkPoints[0].x
  );
  const maxY = landmarkPoints.reduce(
    (max, p) => (p.y > max ? p.y : max),
    landmarkPoints[0].y
  );

  return {
    x: minX - 10,
    y: minY - 24,
    width: maxX - minX + 24,
    height: maxY - minY + 70,
  };
}
