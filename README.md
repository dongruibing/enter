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

使用2D上下文提供的方法可以绘制简单的2D图形，如矩形、弧线和路径等。2D上下文的原点坐标为(0,0)，位于\<canvas>元素的左上角，x轴正方向为水平向右，y轴正方向为水平向下，width和height表示水平和垂直方向上可用的的像素数目。详细参考手册可参考[菜鸟教程](http://www.runoob.com/tags/ref-canvas.html)。下面简单介绍一下

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
* `textBaseline`: 文本的基线。
* `fillText(text,x,y)`: 使用fillStyle绘制文本。
* `strokeText(text,x,y)`: 使用strokeStyle为文本描边。
* `measureText()`: 该方法返回一个对象，该对象目前只包含以像素计的指定字体得宽度width。

####2.4 变换

当年不好好学数学，以为现在当了程序猿搬砖就能摆脱魔爪了？呵呵，你想多了，出来混迟早要还的。

* `rotate(angle)`: 围绕原点旋转绘图angle`弧度`,旋转只会影响到旋转完成后的绘图。
* `scale(scaleX,scaleY)`: 缩放图像，在x轴方向乘以scaleX,y轴方向乘以scaleY。
* `translate(x,y)`: 将坐标原点移到(x,y)。
* `transform(m1_1,m2_2,m2_1,m2_2,dx,dy)`: 直接修改变换矩阵，上述旋转，缩放，平移都可以用transform()实现，假设点A(x,y)到点B(x',y'）变换变换矩阵的算法为:

* `transform(m1_1,m1_2,m2_1,m2_2,dx,dy)`: 直接修改变换矩阵，上述旋转，缩放，平移都可以用transform()实现，假设点A(x,y)到点B(x',y'）变换变换矩阵的算法为:
> x' = x*m1_1 + y*m1_2 + 1*dx

> y' = x*m2_1 + y*m2_2 + 1*dy
