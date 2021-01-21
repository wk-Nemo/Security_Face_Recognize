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

        }
    },
})

$('#chooseImage').on('change', function() {//当chooseImage的值改变时，执行此函数
    var filePath = $(this).val(), //获取到input的value，里面是文件的路径
    fileFormat = filePath.substring(filePath.lastIndexOf(".")).toLowerCase(),
    src = window.URL.createObjectURL(this.files[0]); //转成可以在本地预览的格式
    
    // 检查是否是图片
    if(!fileFormat.match(/.png|.jpg|.jpeg/)) {
    alert('上传错误,文件格式必须为：png/jpg/jpeg');
    return;
    }
    if(this.files[0].size>6*1024*1024){
    alert('上传错误,文件大小必须小于6M');
    return;     
    }
    $('#cropedBigImg').css('display','block');
    $('#cropedBigImg').attr('src', src); 
    console.log(src);
});