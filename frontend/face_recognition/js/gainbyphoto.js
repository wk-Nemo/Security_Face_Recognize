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

// 人脸特征向量
let descriptor = []

const imageUpload = document.getElementById('imageUpload')
const my_img = document.querySelector('#my_img')
my_img.onclick = function () {
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
        image.style.height = '450px'
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
            descriptor.push(detection.descriptor)
        })
    })
}

/*负数据库相关*/
var NDB = []         // 负数据库
var lens = []        // 隐藏串s的每个128维向量二进制串的长度
var flag = []        // 正负号 
var min = lens[0]    // 最小位数
var specific = ''    // 异或串
var s = ''           // 隐藏串s
var m = 0            // s的位数
var cn = 0           // NDB长度 
var p = []           // 概率参数p，表示取第几种类型的概率
var q = []           // 概率参数q，表示第几位取反的概率
var posbility = []   // 概率，[i][0]是取反的概率（Pdiff），[i][1]是取正的概率（Psame）
var Pos = []         // 位置
var Gen = []         // 期望值
var cc = []          // 0-1023的01串

/* 二进制串转换方法 */
// 存储128个单独数据的二进制串和长度的数据结构
function MyNumber(s, len, flag) {
    this.s = s       // 每个数字的二进制
    this.len = len   // 每个数字的二进制长度
    this.flag = flag // 每个数字的正负号
}

// 将128个数据转换成二进制并且连接在一起
function floatTo2(num) {
    // 判断正负号
    var a = []
    if(num > 0) {
        var flag = 1
    } else {
        var flag = -1
        num = -num
    }

    // 将数字主体部分转换成整数并二进制化
    var b = num*Math.pow(10, 3)
    b = Math.round(b)
    b = b.toString(2)
    
    // 将不足部分的0填进去
    for (let i=0; i<10-b.length; i++) {
        a.push('0')
    }

    //将主体部分二进制串和头部符号合在一起
    var front = a.join('')
    var result = front.concat(b)
    
    // 将二进制串和长度一起传递给MyNumber
    var myNum = new MyNumber(result, result.length, flag)
    return myNum
}

// 合并的二进制串s转换成128向量
function to128Float(s, lens) {
    var res = []
    var count = 0
    // 使用一个简单的slice将128个数据连接在一起
    for (let i=0; i<128; i++) {
        res[i] = s.slice(count, count+lens[i])
        count = count + lens[i] 
    }
    return res
}

// 查找最小lens
function minLen() {
    min = lens[0] 
    for (let i=1; i<lens.length; i++) {
        if (lens[i] < min) {
            min = lens[i]
        }
    }
}

// 二进制小数转换成十进制数的方法
// 该方法主要将128个数据的二进制转换成十进制
function toFloat(s, flag) {
    minLen()
    var num = 0
    var count = min - 1
    for (let i=0; i<min; i++) {
        if (s[i] === '1') {
            num += Math.pow(2, count)
        }
        count--
    }
    num = num*flag
    return num
}

/*负数据库生成算法*/
// 存储单个生成的负数据库信息的数据结构
function Ent(p, c) {
    this.p = p  // 三个位
    this.c = c  //记录此位是'0'还是'1’
}

function diff(i) {                  
	var Ndiff = 0
	var Nsame = 0
	for (let j = 1; j <= 3; j++) {
		Ndiff += j * p[j] * q[i]    //求和  公式6
	}
	for (let j = 1; j <= 3; j++) {
		Nsame += ((3 - j)*p[j]) / 10  //属性中长度最大的为10   //公式7
	}

	var Pdiff = 0;
	Pdiff = Ndiff / (Ndiff + Nsame)  //控制一个属性中第i位不同于隐藏串s   公式5
	return Pdiff;
}

// 0到1023转换成2进制，用于初始化cc
function myTo2(num) {
     // 判断正负号
     var a = []
     // 将数字主体部分转换成整数并二进制化
     var b = num.toString(2)   
     // 将不足部分的0填进去
     for (let i=0; i<10-b.length; i++) {
         a.push('0')
     }
     //将主体部分二进制串和头部符号合在一起
     var front = a.join('')
     var result = front.concat(b) 
     return result
}

// 随机生成一个异或串
function getSpecific() {
    var specific_res = []
    for (let i=0; i<1280; i++) {
        let x = Math.random()
        if (x < 0.5) {
            specific_res.push('0')
        } else {
            specific_res.push('1')
        }
    }
    var s = specific_res.join('')
    console.log(s)
    return s
  }
  

// 初始化p，q和posbility
function init() {
    m = s.length    //字符串位数
	r = 7  
	p[0] = 0
	p[1] = 0.95
	p[2] = 0.03
	p[3] = 0.02   //K=3
    cn = m*r

	q[0] = 0.55
	q[1] = 0.05
	q[2] = 0.05
	q[3] = 0.05
	q[4] = 0.05
	q[5] = 0.05
	q[6] = 0.05
	q[7] = 0.05
    q[8] = 0.05
    q[9] = 0.05


    specific = getSpecific()

	for (let i = 0; i < 10; i++) {   
        //最大位数为20
        posbility[i] = []
		posbility[i][0] = diff(i)   //每一个属性与隐藏串不同的概率  即属性取反
		posbility[i][1] = 1 - posbility[i][0]   //每一个属性与隐藏串想同的概率
	} 

    // 初始化cc
    for (let i=0; i<=1023; i++) {
        cc.push(myTo2(i))
    }
}

// 异或
function xor(s) {
    let res = []
    for (let i=0; i<1280; i++) {
        if (s[i] === specific[i]) {
            res.push('0')
        } else {
            res.push('1')
        }
    }
    let result = res.join('')
    return result
}

// 反位生成
function generateRandomNumbers(l)	
{ 
    var count = 0
    for (let i=9; i>=0; i--) {
        count += q[i]
        if (l < count) {
            return i
        }
    }
}

//判断0，1
function judge(s) {
    if(s === '1') {
        return '0'
    } else {
        return '1'
    }
}

//生成负数据库
function f(s) {
    var n = 0
    do {
        var v_p =[]
        var v_c = []
        var v = new Ent(v_p, v_c)
        //生成0-1的随机数，用于选择属性
        var t = Math.random()
        //生成类型一
        if(t < p[1]) {
            // console.log("1")
            var diff1 = 0
			var same1 = 0
			var same2 = 0
			var attr = 0
            // 随机生成属性的号数，即选择哪个属性
            attr = Math.floor(Math.random()*128)

            // 通过属性q决定属性的哪一位与原始位不同  得到不同类型的位
			diff1 = generateRandomNumbers(Math.random())
            // 生成的反转的位数
			v.p[0] = diff1 + attr * 10 
            // 反转后的字符，与s相反
			v.c[0] = judge(s[v.p[0]]) 

            same1 = Math.floor(Math.random()*10)
			while (same1 === diff1) {   //如果与反转位的位号相同，则重新生成
				same1 = Math.floor(Math.random()*10)
			}
			v.p[1] = same1 + attr * 10;    //相同位
			v.c[1] = s[v.p[1]];

			same2 = Math.floor(Math.random()*10)
			while (same2 === diff1 || same2 === same1) {
				same2 = Math.floor(Math.random()*10)
			}
			v.p[2] = same2 + attr * 10;
			v.c[2] = s[v.p[2]];
        }
        //生成类型二
        else if(t < p[1] + p[2]) {
            // console.log("2")
            var diff1 = 0
			var diff2 = 0
			var same1 = 0
			var attr = 0
            // 随机生成属性的号数，即选择哪个属性
			attr = Math.floor(Math.random()*128)

            // 通过属性q决定属性的哪一位与原始位不同  得到不同类型的位
			diff1 = generateRandomNumbers(Math.random())
            // 生成的反转的位数
			v.p[0] = diff1 + attr * 10;    
            // 反转后的字符，与s相反
			v.c[0] = judge(s[v.p[0]])  

            diff2 = generateRandomNumbers(Math.random())
            while (diff2 === diff1) {
				diff2 = generateRandomNumbers(Math.random());
			}
            v.p[1] = diff2 + attr * 10;
			v.c[1] = judge(s[v.p[1]]) 

            same1 = Math.floor(Math.random()*10)
			while (same1 === diff1 || same1 === diff2) {
				same1 = Math.floor(Math.random()*10)
			}
			v.p[2] = same1 + attr * 10;
			v.c[2] = s[v.p[2]];
        }
        //生成类型三
        else {
            // console.log("3")
            var diff1 = 0
			var diff2 = 0
			var diff3 = 0
			var attr = 0
            // 随机生成属性的号数，即选择哪个属性
			attr = Math.floor(Math.random()*128)

            // 通过属性q决定属性的哪一位与原始位不同  得到不同类型的位
			diff1 = generateRandomNumbers(Math.random())
            // 生成的反转的位数
			v.p[0] = diff1 + attr * 10    
            // 反转后的字符，与s相反
			v.c[0] = judge(s[v.p[0]])   

            diff2 = generateRandomNumbers(Math.random())
            while (diff2 === diff1) {
				diff2 = generateRandomNumbers(Math.random());
			}
            v.p[1] = diff2 + attr * 10
			v.c[1] = judge(s[v.p[1]]) 

            diff3 = generateRandomNumbers(Math.random())
            while (diff3 === diff1 || diff3 === diff2) {
				diff3 = generateRandomNumbers(Math.random());
			}
            v.p[2] = diff3 + attr * 10;
			v.c[2] = judge(s[v.p[2]]) 
        }
        //负数据库确定位赋值 
        NDB[n] = v
        n++
    }while(n < cn)
}

/*计算期望，得到一个串*/ 
// 统计负数据库中0和1的个数
function num_01() {
    for (let i = 0; i < m; i++) {
        Pos[i] = []
        Pos[i][0] = 0
        Pos[i][1] = 0
	}
	for (let i = 0; i < cn; i++) {
		for (let j = 0; j < 3; j++) {
			if (NDB[i].c[j] === '0') {
                Pos[NDB[i].p[j]][0]++
            }
			else {
                Pos[NDB[i].p[j]][1]++
            }
		}
	}
}

/*进行欧氏距离计算*/
//传入的值为原始串中第i位的索引值(可以认为第i个属性值的第一位索引值    num为原串在该位的值为0或者1)
function  Pr(index, num) {
	var pr1 = 0
	var pr0 = 0
	var tmp = index % 10
	var pdiff = posbility[tmp][0]
	var psame = posbility[tmp][1]
    pr0 = (Math.pow(pdiff, Pos[index][1])*Math.pow(psame, Pos[index][0])) / (Math.pow(pdiff, Pos[index][1])*Math.pow(psame, Pos[index][0]) + Math.pow(pdiff, Pos[index][0])*Math.pow(psame, Pos[index][1]))
	if (num === '1') {
	    pr1 = 1 - pr0
		return pr1;
	}
	else {
		return pr0;
	}
}

// 计算每个属性为-999-999的概率
// index分别是0， 11， 22 ...等一系列128个数据
// real是-999-999等所有可能会出现的值
function calculate(index, real) {
    // sum是概率
    var sum = 1
    // 分别计算每一位的概率，然后相乘得到sum的概率
    for (let i=0; i<10; i++) {
        // index表示的是位置；cc表示的是-999到999的每个数的二进制
        var tmp = Pr(index + i, cc[real][i])
        sum = sum*tmp
    }
    // 概率和值相乘，满足定理3中的一项
    // sum *= Math.pow(real, 2)
    sum *= real
    return sum
}

// 计算每个属性的期望值，采用定理三的公式
// index分别是0， 10， 20 ... 1270等一系列128个数据
function E(index) {
    // tmp是总和，欧氏距离
    var tmp = 0
    for (let i=0; i<=1023; i++) {
        tmp += calculate(index, i) 
    }
    // tmp = Math.pow(tmp, 0.5)
    return tmp
}

// 计算128个属性数据的期望
function getAttr() {
    var count = 0
    for (let i=0; i<m; i++) {
        if (i % 10 === 0) {
            Gen[count] = E(i)
            count++
        }
    }
}

function createNDB() {
    alert("ok")
}

const getNDB = document.getElementById('getNDB')
const get_ndb = document.getElementById('get_ndb')
get_ndb.onclick = function() {
    getNDB.click()
}
getNDB.addEventListener("click", createNDB, false)









































