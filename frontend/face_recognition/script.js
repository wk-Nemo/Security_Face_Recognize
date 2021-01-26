const imageUpload = document.getElementById('imageUpload')

Promise.all([
    // 加载模型
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
    //创建container容器并添加到body
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.getElementById("photo").append(container)

    // const labeledFaceDescriptors = await loadLabeledImages()
    // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors,.6)

    //监听照片变化事件
    imageUpload.addEventListener('change', async () => {
        //获取照片，设置样式，添加到容器中
        const image = await faceapi.bufferToImage(imageUpload.files[0])
        image.style.width = '700px'
        container.append(image)

        //创建画布
        const canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)

        //获取图像尺寸
        const displaySize = {
            width: image.width,
            height: image.height
        }

        //设置面部特征点和画布匹配
        faceapi.matchDimensions(canvas, displaySize)

        //获取照片上的所有人脸并存入数组
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        //匹配画布尺寸
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        //循环遍历每张脸，并画上盒子
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: 'face'
            })
            drawBox.draw(canvas)
            
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            console.log(detection.descriptor);
        })
    })
}

// function loadLabeledImages() {
//     const labels = ['Taylor Swift','Wu Kui']
//     return Promise.all(
//         labels.map(async label => {
//             const descriptions = []
//             for(let i=0; i<=2; i++){
//                 const img = await faceapi.fetchImage('https://github.com/wk-Nemo/face_api.js/blob/main/labeled_images/Wu%20Kui/1.jpg?raw=true')
//                 const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptors()
//                 descriptions.push(detections.descriptor)
//             }
            
//             return new faceapi.LabeledFaceDescriptors(label, descriptions)
//         })
//     )
// }