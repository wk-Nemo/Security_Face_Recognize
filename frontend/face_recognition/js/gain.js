var app = new Vue({
    el: "#nav",
    data: {
        Active: [false, false, true, false],
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
            this.isShow = true;
            let constraints = {
                video: true,
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

            let video_model = document.querySelector('#video_model');
            // video_model.removeChild(video_model.children[1]);
            // console.log("移除成功");
        },

        take_picture: function () {

          
        },

    },
})

