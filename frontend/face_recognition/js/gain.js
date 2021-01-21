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

var app2 = new Vue({
    el: "#photo",
    data: {
        isShow: false,
        imgsrc: "../images/head.jpg",
    },
    methods: {
        redis: function () {
            console.log("摄像头打开成功");
            this.isShow = true;
            let constraints = {
                video: { width: 900, height: 500 },
                audio: false
            };
            
            let promise = navigator.mediaDevices.getUserMedia(constraints);
            promise.then(function (MediaStream) {
                video.srcObject = MediaStream;
                video.play();
            }).catch(function (PermissionDeniedError) {
                console.log(PermissionDeniedError);
            })
        },

        hide: function () {
            let stream = document.getElementById('video').srcObject;
            let tracks = stream.getTracks();

            tracks.forEach(function (track) {
                track.stop();
            });

            document.getElementById('video').srcObject = null;
            this.isShow = false;
        },

        take_picture: function () {
            let canvas = document.getElementById('temp_canvas');
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 80, 80);
            // toDataURL  ---  可传入'image/png'---默认, 'image/jpeg'
            let img = document.getElementById('temp_canvas').toDataURL();
            // 这里的img就是得到的图片
            console.log('img-----', img);
            document.getElementById('imgTag').src = img;
            // if (videL.paused) {
            //     videL.play();
            // } else {
            //     videL.pause();
            // }
        },

        chooseImage: function () {
            
        },
    },
})

