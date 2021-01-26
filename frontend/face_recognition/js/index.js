var app = new Vue({
    el: "#nav",
    data: {
        Active: [true, false, false, false],
        message: '加密人脸检测'
    },
    //方法
    methods: {
        floor: function (p1) {
            if (p1==0) {
                this.Active = [true,false,false,false];
            }
            else if (p1==1) {
                this.Active = [false,true,false,false];
            }
            else if (p1==2) {
                this.Active = [false,false,true,false];
            }
            else {
                this.Active = [false,false,false,true];
            }
            
        }
    },
})

var body = new Vue({
    el: '#introduce',
    data: {
        detailed_introduction: '不同于传统人脸识别方案，我们在最重要的数据处理环节选择将用户数据加密后存储，即使暴露也不必担心安全问题',
    }
})