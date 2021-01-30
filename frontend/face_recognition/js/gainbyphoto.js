var app = new Vue({
    el: "#nav",
    data: {
        Active: [false, true, false, false],
        message: '加密人脸检测',


    },
    //方法
    methods: {
        floor: function (p1) {
            if (p1 == 0) {
                this.Active = [true, false, false, false];
            }
            else if (p1 == 1) {
                this.Active = [false, true, false, false];
            }
            else if (p1 == 2) {
                this.Active = [false, false, true, false];
            }
            else {
                this.Active = [false, false, false, true];
            }

        },

    },
})


const imageUpload = document.getElementById('imageUpload')
const my_img = document.querySelector('#my_img')
my_img.onclick = function () {
    console.log('按钮被点击了');
    imageUpload.click();
}

Promise.all([
    // 加载模型
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
    //监听照片变化事件
    imageUpload.addEventListener('change', async () => {
        //删除子节点
        const my_photo = document.getElementById('myphoto')
        if(my_photo.firstChild != null){
            my_photo.removeChild(my_photo.firstChild);
        }

        //创建container容器并添加到body
        const container = document.createElement('div')
        container.style.position = 'relative'
        container.style.height = "580px"
        document.getElementById("myphoto").append(container)  

        //获取照片，设置样式，添加到容器中
        const image = await faceapi.bufferToImage(imageUpload.files[0])
        image.style.height = '580px'
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