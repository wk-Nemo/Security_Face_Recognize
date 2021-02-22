const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('../models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('../models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../models'),
  faceapi.nets.faceExpressionNet.loadFromUri('../models')
]).then(startVideo)

function startVideo () {
  const constraints = { video: true };
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (mediaStream) {
      video.srcObject = mediaStream;
      video.onloadedmetadata = function (e) {
        video.play()
      }
    })
    .catch(function (err) { console.log(err.name + ': ' + err.message)})
}

// startVideo();

video.addEventListener('play', () => {
  //添加画布
  const canvas = faceapi.createCanvasFromMedia(video)
  const video_model = document.getElementsByClassName("video_model")
  video_model[0].appendChild(canvas)  

  //获取视频尺寸，让画布匹配视频
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  //设置一个间隔函数，检测视频中的人脸
  setInterval(async () => {
    //加载检测器
    const detections = await faceapi.detectAllFaces(video,
      new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
    
    // console.log(detections[0].descriptor)

    const resizeDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

    faceapi.draw.drawDetections(canvas, resizeDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
  }, 100)
})


