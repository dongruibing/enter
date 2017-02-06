# 知识分享：canvas实现明星、神豪入场特效

不用说，HTML5添加的最受欢迎的就是canvas元素，非常强大有意思，在这我跟前端的同学们分享一下canvas明星、神豪入场特效的实现，希望大家共同学习、共同进步，多多分享自己学到的知识点，在此本人先抛块砖，技术水平有限，有错误的地方还请各位同学指出更正！

## 一、canvas基本知识点

目前IE9+、Firefox 1.5+、Safari 2+、Opera 9+、Chrome、iOS版Safari以及Android版WebKit都在某种程度上支持\<canvas>

### 1、基本用法

```
<canvas id="drawing" width="200" height="200">这是一块画布。</canvas>
```
上述\<canvas>元素具有width和height属性，指的是画布的大小。与其他元素一样\<canvas>元素对应的DOM对象也有width和height属性，这二者之间的关系大家自己研究一下吧。

要在这块画布上绘图，首先需要取得绘图的2D上下文，需要调用getContext()方法并传入“2d”。

```
var drawing = document.getElementById("drawing");

//判断是否支持canvas
if(drawing.getContext){
    var ctx = drawing.getContext("2d");
    // code
}
```
 
### 2、2D上下文

使用2D上下文提供的方法可以绘制简单的2D图形，如矩形、弧线和路径等。2D上下文的原点坐标为(0,0)，位于\<canvas>元素的左上角，x轴正方向为水平向右，y轴正方向为垂直向下，width和height表示水平和垂直方向上可用的的像素数目。详细参考手册可参考[菜鸟教程](http://www.runoob.com/tags/ref-canvas.html)。下面简单介绍一下

####2.1 填充和描边

* `fillStyle`: 设置或返回用于填充绘画的颜色、渐变或模式。可以使用CSS中指定颜色的值得任何格式。
* `strokeStyle`: 设置或返回用于笔触的颜色、渐变或模式。可以使用CSS中指定颜色的值得任何格式。

####2.2 绘制矩形

* `fillRect(x,y,width,height)`: 绘制"被填充"的矩形，填充颜色由fillStyle属性指定。
* `strokeRect(x,y,width,height)`:	绘制矩形（无填充），描边颜色由strokeStyle属性指定。
* `clearRect(x,y,width,height)`: 清除一块矩形区域像素值，以便再次绘制图形。

以上方法参数中x,y为矩形左上角顶点坐标，width,height为矩形的宽和高。

####2.3 绘制路径

绘制路径需要首先调用beginPath()方法，表示开始绘制路径，然后调用如下方法绘制所需图形。
* `arc(x,y,radius,startAngle,endAngle,counterclockwise)`: 以(x,y)为圆心，以radius为半径，以startAngle为起始角度，以endAngle为结束角度绘制一条弧线。counterclockwise表示是否按逆时针方向计算，false表示顺时针
* `arcTo(x1,y1,x2,y2,radius)`: 从上一点,设为(x0,y0)开始绘制一条弧线,假设点(x0,y0)为A点，点(x1,y1)为B点，点(x2,y2)为C点，弧线以radius为半径，并且与∠ABC的两条边相切，如果切点不是A、C两点，那么切点将与A、C两点直线相连。
* `bezierCurveTo(c1x,c1y,c2x,c2y,x,y)`: 从上一点开始绘制一条三次贝塞尔曲线，到(x,y)为止，以(c1x,c1y),(c2x,c2y)为控制点。
* `lineTo(x,y)`: 从上一点开始绘制一条直线到(x,y)。
* `moveTo(x,y)`: 将绘图游标移到点(x,y)，不画线。
* `quadrticCurveTo(cx,cy,x,y)`: 从上一点开始绘制一条二次贝塞尔曲线，cx、cy为控制点，以(x,y)为结束点。
* `react(x,y,width,height)`: 以(x,y)为左上顶点，以width和height为宽高，绘制一个矩形。

创建路径后有一下几种选择：1、closePath():绘制一条连接到起点的线条；2、fill():用fillStyle填充路径；3、stroke():用strokeStyle对路径进行描边。4、clip():在路径上创建一个裁切区域,提示：一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内（不能访问画布上的其他区域）。也可以在使用 clip() 方法前通过使用 save() 方法对当前画布区域进行保存，并在以后的任意时间对其进行恢复（通过 restore() 方法）。

####2.4 绘制文本

* `font`: 表示文本样式、大小及字体。与CSS中设定方法相同。
* `textAlign`: 文本的对其方式。
* `textBaseline`: 文本的基线。zuobiao
* `fillText(text,x,y)`: 使用fillStyle绘制文本。
* `strokeText(text,x,y)`: 使用strokeStyle为文本描边。
* `measureText()`: 该方法返回一个对象，该对象目前只包含以像素计的指定字体得宽度width。

####2.5 变换

当年不好好学数学，以为现在当了程序猿搬砖就能摆脱魔爪了？呵呵，你想多了，出来混迟早要还的。

* `rotate(angle)`: 围绕原点旋转绘图angle`弧度`,旋转只会影响到旋转完成后的绘图。
* `scale(scaleX,scaleY)`: 缩放图像，在x轴方向乘以scaleX,y轴方向乘以scaleY。
* `translate(x,y)`: 将坐标原点移到(x,y)。
* `transform(m1_1,m2_2,m2_1,m2_2,dx,dy)`: 直接修改变换矩阵，上述旋转，缩放，平移都可以用transform()实现，假设点A(x,y)到点B(x',y'）变换变换矩阵的算法为:

> x' = x\*m1_1 + y\*m1_2 + 1\*dx

> y' = x\*m2_1 + y\*m2_2 + 1\*dy

由此可见：

> `transform(Math.cos(θ*Math.PI/180),Math.sin(θ*Math.PI/180),-Math.sin(θ*Math.PI/180),Math.cos(θ*Math.PI/180),0,0)` = `rotate(θ)`

> `transform(scaleX,0,0,scaleY,0,0)` = `scale(scaleX,scaleY)`

> `transform(1,0,0,1,dx,dy)` = `translate(dx,dy)`


####2.6 绘制图像

* `drawImage(img,x,y)`: 在画布上绘制一个图像，图像位置为(x,y)。

* `drawImage(img,x,y,width,height)`: 在画布上绘制一个图像，图像位置为(x,y)，宽高分别为width和height。

* `drawImage(img,sx,sy,swidth,sheight,x,y,width,height)`: 将原图像坐标(sx,sy)，宽高为swidth,sheight的区域，绘制到画布坐标为(x,y), 宽高为width,height区域。

####2.7 使用图像数据

使用图像功能非常强大，getImageData()可以直接获取原始图像数据，此方法返回一个对象，此对象包含三个属性：width、height和data。data属性是一个数组，保存着图像中每一个像素的数据，每一个像素用4个元素保存，分别为r、g、b、a值，为什么说这个功能强大呢？由此可看出你可以随意操控图像中的任意一个像素的值，图像处理，模式识别莫过于此。

* `getImageData(x,y,width,height)`: 返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据。

* `putImageData(imgData,x,y,dirtyX,dirtyY,dirtyWidth,dirtyHeight)`: 将imgData对象数据放回画布上。

* `createImageData(width,height)`: 以指定的尺寸（以像素计）创建新的 ImageData 对象。

* `.createImageData(imageData)`: 创建与指定的另一个 ImageData 对象尺寸相同的新 ImageData 对象（不会复制图像数据）。


####2.8 阴影

* `shadowColor`: 设置或返回用于阴影的颜色。

* `shadowBlur`: 设置或返回用于阴影的模糊级别。

* `shadowOffsetX`: 设置或返回阴影与形状的水平距离。

* `shadowOffsetY`: 设置或返回阴影与形状的垂直距离。

####2.9 渐变

* `createLinearGradient(x0,y0,x1,y1)`: 创建线性渐变。(x0,y0)：起点，(x1,y1):终点。

* `createRadialGradient(x0,y0,r0,x1,y1,r1)`: 创建放射性渐变，从一个圆到另一个圆。

* `addColorStop(stop,color)`: 规定渐变对象中的颜色和位置。stop:0~1;color:颜色，可以多次使用。
 
####2.10 模式

* `createPattern(image,"repeat|repeat-x|repeat-y|no-repeat")`: 在指定的方向上重复指定的元素。

####2.11 合成
        
* `globalAlpha`: 设置或返回绘图的当前 alpha 或透明值,介于 0.0（完全透明） 与 1.0（不透明） 之间。

* `globalCompositeOperation`: 设置或返回新图像如何绘制到已有的图像上。有很多值可选，详细请查阅手册。

## 二、入场效果实现

基础总是枯燥乏味，下面来看看用canvas如何实现明星、土豪入场效果。


###1、远程加载并解压缩zip包

获取和解压缩所使用的库文件为[JSZip](https://github.com/Stuk/jszip),具体如何使用请参考[这里](https://stuk.github.io/jszip/)，需要注意的是JSZip的API是异步调用的，还需要学习下Promise。当zip包从服务器加载完成后，对zip包内的图片按文件夹解压缩并排序，注意解压缩出来的图片顺序并不固定，需要重新排序，sortFs()函数提供了排序功能。具体如何实现请参考gift.js中enter.animate()函数。

```
 enter.animate = function(canvas, option, callback){
			var startTime ;

			
			if(canvas.getContext('2d')){                   //获取2D上下文
				enter.ctx = canvas.getContext('2d');
			}else{
				if(callback){
					callback(new Error("this is not a canvas element"));
				}
				return;
			}
			enter.canvas = canvas;                         //
			enter.type = option.type;					   //1：明星入场；2：神豪入场
			
			avatar.image = new Image();					   //获取用户头像
			avatar.ready = false;
			avatar.image.onload = function(){
				avatar.ready = true;
			}
			avatar.image.src = option.avatar;

			var width1,height1; 							//判断是横屏直播间还是竖屏直播间
			width1 = getStyle(canvas, "width");
			width1 = parseInt(width1);
			height1 = getStyle(canvas, "height");
			height1 = parseInt(height1);
			if(width1 > height1){
				enter.width = 2373;
				enter.screenTpy = 2;
			}
			canvas.width = enter.width;
			canvas.height = enter.height;
			canvas.style.backgroundColor = "rgba(0, 0, 0, 0.4)";

			if(enter.load == true){
				requestAnimFrame(play);
			}else{											//加载zip包
				var hostname = location.hostname.indexOf("test1") == -1 ? "static.yizhibo.com" : "static.yizhibo.com"; //teststatic.yizhibo.com
				gift._getBinaryContent("//" + hostname+ "/js/libs/gift/zips/enter.zip", function(err, data) {
				    if(err) {
				    	 enter.load = false;
				    	 if(callback){
				    	 	callback(err); // or handle err
				    	 }
				        
				        return;
				    }
				    var zip = new JSZip();
				    zip.loadAsync(data) 				//
				    .then(function(zip){
				    	var starFs = (zip.file(/^mingxing\/[0-9]{1,}.png$/));       //明星入场图片文件
				    	var shenhaoFs = (zip.file(/^shenhao\/[0-9]{1,}.png$/));		//神豪入场图片文件
				    	var lightFs = (zip.file(/^light\/[0-9]{1,}.png$/));			//灯光图片文件
				    	var backFs = (zip.file(/^back\/[0-9]{1,}.png$/));			//星光背景图片文件

				    	var promiseList = [];

				    	sortFs(starFs);        //图片排序
				    	sortFs(shenhaoFs);
				    	sortFs(lightFs);
				    	sortFs(backFs);

				    	for(var i = 0; i<starFs.length; i++){
				    		promiseList.push(starFs[i].async("base64"));

				    	}
				    	for(var i = 0; i<shenhaoFs.length; i++){
				    		promiseList.push(shenhaoFs[i].async("base64"));

				    	}
				    	for(var i = 0; i<lightFs.length; i++){
				    		promiseList.push(lightFs[i].async("base64"));

				    	}
				    	for(var i = 0; i<backFs.length; i++){
				    		promiseList.push(backFs[i].async("base64"));

				    	}

					   return JSZip.external.Promise.all(promiseList)
					    .then(function(list){
					    	list = list.map(function(item, index, array){          //将图片文件生成为base64格式的图片并存储在各自的数组中，以备后续使用
					    		var img = new Image();
					    		img.src = "data:image/png;base64," + item;
					    		return img;
					    	});
					    	star.images = list.splice(0, starFs.length);
					    	shenhao.images = list.splice(0, shenhaoFs.length);
					    	light.images = list.splice(0, lightFs.length);
					    	back.images = list.splice(0, backFs.length);
					    },function error(e) {
						    // handle the error
						    enter.load = false;
						    zip = null;
						    
						});

				    })
				    .then(function(){
				   		requestAnimFrame(play);
						
				    })
					.then(function(){
						enter.load = true;
						zip = null;

					},function error(e) {
						    // handle the error
						    enter.load = false;
						    zip = null;
						    if(callback){
						    	callback(e);
						    }
						    
						    
					});  

				});
			}


			function play(timestamp){                 //动画运行控制
				if(!startTime){
					startTime = timestamp;
				}
				var runTime = timestamp - startTime;
				// console.log(runTime);
				
				if(runTime <= 8000){
					enter.ctx.clearRect(0, 0, enter.width, enter.height);
					ctrl.draw(runTime);
					back.draw(runTime);
					light.draw(runTime);
					avatar.draw(runTime);
					switch(enter.type){
						case 1:
							star.draw(runTime);       	//明星入场
							break;
						case 2:
							shenhao.draw(runTime);		//神豪入场
							break;
					};
					requestAnimFrame(play);

				}
		    	else{

		    		enter.ctx.clearRect(0, 0, enter.width, enter.height);
		    		enter.canvas.style.backgroundColor = "transparent";
		    		if(callback){
		    			callback();
		    		}
		    		
		    	}			
			}

			function sortFs(files){                      //文件排序
				files.sort(function(v1, v2){
					v1 = v1.name.match(/([0-9]+)\.png/)[1];
		    		v2 = v2.name.match(/([0-9]+)\.png/)[1];
		    		v1 = parseInt(v1);
		    		v2 = parseInt(v2)
		    		return v1 - v2;
				});
			}

		}
```
 
###2、图片播放与合成
 
共有5组4类图片需要播放，分别存储在5个对象的image[s]属性中，star：明星、shenhao：神豪、light：灯光、back：星光背景、avatar：头像。1、明星和神豪图片播放方式相同，为固定帧速率，从而实现动画效果。2、灯光需要将图片进行放大和旋转，从而实现摇摆聚焦效果3、星光背景需要不停改变图片透明度，从而实现星光闪烁效果。4、头像需要将方形显示为圆形。整个入场动画总时长 8s。
 
####2.1 实现固定帧速率播放图片
 
大家都知道动画其实就是用固定的时间间隔播放一组图片所形成的，由于视觉暂留效应，只要播放速度足够快，人眼就识别不出来图片是一张一张播放的。那好，现在我们已经获取到了神豪和明星的入场的图片组，两组图片各自75张，存储在star.images和shenghao.images数组中，需要0~3s播完，需要多长时间播一帧呢？3000ms/75 = 40ms,有的同学可能想到了用setTimeout()或者setInterval()就可以实现了！没错，是可以实现，但有个问题需要思考一下，程序是严格按照setTimeout()和setInterval()设定的时间运行的吗？答案自己找吧。

canvas动画一般都使用requestAnimationFrame(callback),简单理解就是屏幕每次要刷新时就会调用callback函数，并传入一个以毫秒为单位的时间戳参数。网上资料太多了，就不细讲了。下面看看明星图片组的播放控制，神豪同理。

```
    var star = {				//明星绘图控制
			images: [],
			X: 125,					//竖屏直播间绘图位置起始点
			Y: 310,
			// X1: 936,
			// Y1: 310,
			X1: 540.6,				//横屏直播播间绘图起始点
			Y1: 156.6,
			interval: 40,			//帧速率控制
			draw: function(t){		
				var index = Math.floor(t/this.interval); //当前帧计算

				if(index >= this.images.length){     
					index = this.images.length-1;
				}
				if(enter.screenTpy == 1){                //竖屏
					enter.ctx.drawImage(this.images[index], this.X, this.Y);
				}else{									//横屏
					enter.ctx.save();
					enter.ctx.scale(1.5, 1.5);
					enter.ctx.drawImage(this.images[index], this.X1, this.Y1);
					enter.ctx.restore();
				}
				
			}
		};
```
 
 
 由于直播间分为横屏和竖屏所以动画效果都有两种绘制方法。
 
####2.2  实现灯光摆动效果

灯光一共只有两张图片，左右两个光柱，需要对图片进行放大和旋转，你也许会想，为什么不和上面的土豪和明星图片一样，弄一个图片组播放就可以了？这是因为如果将灯光存储为图片组的话，其大小将要超过10Mb，效果有多烂可想而知。一下是灯光实现控制程序，具体尺寸和时间值是根据动画demo设置的。

```
 
 	var light = {					//灯光绘图控制
			images:[],
			startTime: 2400,            //灯光开始时间
			interval: 100,				//灯光角度控制周期
			step: 0.5233,				//灯光每次改变角度值,暂时没用
			angle: 0,					//灯光角度
			draw: function(t){
				if(t > this.startTime){
					var index = parseInt((t - this.startTime)/this.interval); //帧计算

					
					if(index < 16){
						this.angle = 15*Math.PI/180*(Math.sin(index*Math.PI/15 - Math.PI/2)+1)/2;  //角度计算，灯光内摆,摆动角度按正弦-π/2~π/2区间变化最大内摆15°
					}

					if(index >= 20 && index < 45){                       //16~20帧停止摆动，20帧后向外摆动
						index -= 5;
						this.angle = 15*Math.PI/180*(Math.sin(index*Math.PI/30));
					
					}

					var ctx = enter.ctx;

					if(enter.screenTpy == 1){              //竖屏直播间
						ctx.save();
						ctx.translate(220, -25);           //移动原点到灯光发出点
						ctx.scale(2, 2);
						ctx.rotate(-this.angle);			//灯光图片太小，放大2倍
						ctx.drawImage(this.images[0], -220, -25);   //绘制左侧灯光

						ctx.restore();
						ctx.save();
						ctx.translate(530, -25);          //同理绘制右侧灯光
						ctx.scale(2, 2);
						ctx.rotate(this.angle);
						ctx.drawImage(this.images[1], -530, -25);
						ctx.restore();
						
					}else{                                   //横屏直播间
						ctx.save();
						ctx.translate(1031, -25);
						ctx.scale(2, 2);
						ctx.rotate(-this.angle);
						ctx.drawImage(this.images[0], -220, -25);

						ctx.restore();
						ctx.save();
						ctx.translate(1341, -25);
						ctx.scale(2, 2);
						ctx.rotate(this.angle);
						ctx.drawImage(this.images[1], -530, -25);
						ctx.restore();
					}
					
				}

			}
		};
```
 灯光绘制的基本原理就是，translate()将画布原点移动到光柱的发出点，scale()将光柱图片放大两倍已覆盖更大范围，rotate()将左右光柱同时向内或向外摆动同一个角度，角度值是根据当前帧数，利用正选函数计算得到，不但控制摆动角度而且同时控制摆动速度，摆动速度由 慢 → 快 → 慢 → 停 → 慢 → 快 → 慢 组成。							
 
####2.3 实现星光闪烁背景

星光背景与灯光一样，只具有两张图片。那么怎么实现星空闪烁的背景呢？先看一下程序:

```
		var back = {					//星光绘图控制
			images:[],
			startTime: 2400,            //开始时间
			interval: 100,				//帧周期
			opacity: 1,                 //初始透明度
			draw: function(t){
				if(t > this.startTime){
					var index = parseInt((t - this.startTime)/this.interval);      //帧计算 

					 this.opacity = (Math.cos(index/10*Math.PI) + 1)/2;            //图片透明度计算，按余弦函数规律变化
					 
					 var ctx = enter.ctx;
					 if(enter.screenTpy == 1){                                  //竖屏
					 	 ctx.save();
						 ctx.globalAlpha = this.opacity ;						//设置绘图透明度
						 ctx.drawImage(this.images[0], 0, 0);					
						 ctx.globalAlpha = 1-this.opacity;						//两张背景图的透明度是互补的，一个变弱，另一个增强
						 ctx.drawImage(this.images[1], 0, 0);
						 ctx.restore();
						}else{                                                 //横屏直播间稍复杂，星光背景是三张图片作为一组背景的
						 ctx.save();
						 ctx.globalAlpha = this.opacity ;
						 ctx.drawImage(this.images[0], 50, 0);
						 ctx.drawImage(this.images[1], 811, 0);
						 ctx.drawImage(this.images[0], 1573, 0);

						 ctx.globalAlpha = 1-this.opacity;
						 ctx.drawImage(this.images[1], 100, 0);
						 ctx.drawImage(this.images[0], 811, 0);
						 ctx.drawImage(this.images[1], 1523, 0);
						 ctx.restore();
						}
					 
				}

			}
		};
```

由程序可以看出新光背景其实就是利用globalAlpha，按余弦规律改变两张星光背景的透明度来透叠实现的，是不是 so easy?

####2.4 实现头像绘制 

头像加载地址是作为option对象avatar属性传输过来的，预加载完成就绘制，未完成就不绘制，动画运行是不会等待头像加载的，因为头像加载时间和成功与否是不确定的。先看看程序：

```
var avatar = {							//用户头像绘图控制
			X: 285,								//竖屏头像位置坐标
			Y: 392,
			// X1: 1096,
			// Y1: 392,
			X1: 699,							//横屏头像位置坐标
			Y1: 239,
			r: 92,								//头像半径
			image: "",
			ready: false,						//头像图片是否加载完成
			draw:function(t){
				if(this.ready == true){
					var ctx = enter.ctx;
					if(enter.screenTpy == 1){      //竖屏
						ctx.save();
					    ctx.beginPath();
					    ctx.arc(this.X + this.r, this.Y + this.r, this.r, 0, 2*Math.PI);  //绘制一个和头像大小一样的圆形路径
					    ctx.clip();       //将画布裁剪为路径所绘制的区域
					    ctx.drawImage(this.image,0,0,this.image.width, this.image.height,this.X, this.Y,this.r*2,this.r*2); //将头像绘制到圆形区域内
					    ctx.restore();
					}else{                         	//横屏
						ctx.save();
						ctx.scale(1.5, 1.5);
					    ctx.beginPath();
					    ctx.arc(this.X1 + this.r, this.Y1 + this.r, this.r, 0, 2*Math.PI); 
					    ctx.clip();
					    ctx.drawImage(this.image,0,0,this.image.width, this.image.height,this.X1, this.Y1,this.r*2,this.r*2);
					    ctx.restore();
					}
					

				}
			}
		};
```
 
 首先arc()绘制一个半径为r的路径，clip()将路径裁剪出来，以后绘制的图像都只会在这个区域有效，外部区域无效，这样就绘制出了圆形的头像，最后将开始保存的工作环境推出。可是刚开始我是这么做的：
 
 ```
 var avatar = {
			X: 285,
			Y: 392,
			// X1: 1096,
			// Y1: 392,
			X1: 699,
			Y1: 239,
			r: 92,
			image: "",
			ready: false,
			draw:function(t){
				if(this.ready == true){
					var ctx = enter.ctx;
					if(enter.screenTpy == 1){
						ctx.save();
					    ctx.beginPath();
					    ctx.arc(this.X + this.r, this.Y + this.r, this.r, 0, 2*Math.PI); 
					    ctx.fillStyle = "#fff";
					    ctx.closePath();
					    ctx.fill();
					    ctx.globalCompositeOperation="source-atop";
					    ctx.drawImage(this.image,0,0,this.image.width, this.image.height,this.X, this.Y,this.r*2,this.r*2);
					    ctx.restore();
					}else{
						ctx.save();
						ctx.scale(1.5, 1.5);
					    ctx.beginPath();
					    ctx.arc(this.X1 + this.r, this.Y1 + this.r, this.r, 0, 2*Math.PI); 
					    ctx.fillStyle = "#fff";
					    ctx.closePath();
					    ctx.fill();
					    ctx.globalCompositeOperation="source-atop";
					    ctx.drawImage(this.image,0,0,this.image.width, this.image.height,this.X1, this.Y1,this.r*2,this.r*2);
					    ctx.restore();
					}
					

				}
			}
		};
```
 使用globalCompositeOperation不但程序复杂，而且当灯光与头像叠加时，头像的方形角会微微显露出来，写这篇分享的时候我改用了clip()，效果超好，可见学一个东西看的懂不叫懂，做出来也不叫懂，当你可以教给别人的时候才刚刚懂而已，分享很重要，教给了别人，巩固了自己。
 
####2.5 整体渐变控制

整体渐变控制就是根据动画播放时间，不断的改变\<canvas>元素的透明度。

```
var ctrl = {
				startTime: 6960,        
				interval: 40,
				opacity: 1,
				draw: function(t){
					if(t > this.startTime){
						var index = parseInt((t - this.startTime)/this.interval);  
						this.opacity = 1 - index/25;          		//25帧完成渐隐效果
					}else{
						this.opacity = 1;
					}

					enter.canvas.style.opacity = this.opacity;
				}
		};
```
 
 最后gift.js测试页面为entertest.html，改变canvas的CSS属性的宽和高可测试神豪入场竖屏和宽屏效果。
 
## 三、结束语

写的比较枯燥，感兴趣的同学可以仔细看下，不说了，以后大家多多分享吧，共同向大神靠近一点点。
 
 
