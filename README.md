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

* fillStyle: 设置或返回用于填充绘画的颜色、渐变或模式。可以使用CSS中指定颜色的值得任何格式。
* strokeStyle: 设置或返回用于笔触的颜色、渐变或模式。可以使用CSS中指定颜色的值得任何格式。

####2.2 绘制矩形

* fillRect(x,y,width,height): 绘制"被填充"的矩形，填充颜色由fillStyle属性指定。
* strokeRect(x,y,width,height)	绘制矩形（无填充），描边颜色由strokeStyle属性指定。
* clearRect(x,y,width,height): 清除一块矩形区域像素值，以便再次绘制图形。

以上方法参数中x,y为矩形左上角顶点坐标，width,height为矩形的宽和高。

####2.3 绘制路径

* arc(x,y,radius,startAngle,endAngle,counterclockwise): 以(x,y)为圆心，以radius为半径，以startAngle为起始角度，以endAngle为结束角度绘制一条弧线。counterclockwise表示是否按逆时针方向计算，false表示顺时针
* arcTo(x1,y1,x2,y2,radius): 从上一点,设为(x0,y0)开始绘制一条弧线,假设点(x0,y0)为A点，点(x1,y1)为B点，点(x2,y2)为C点，弧线以radius为半径，并且与∠ABC的两条边相切，如果切点不是A、C两点，那么切点将与A、C两点直线相连。
* bezierCurveTo(c1x,c1y,c2x,c2y,x,y): 从上一点开始绘制一条贝塞尔曲线，到(x,y)为止，以(c1x,c1y),(c2x,c2y)为控制点。
* lineTo(x,y): 从上一点开始绘制一条直线到(x,y)。
* moveTo(x,y): 将绘图游标移到点(x,y)，不画线。

以上方法参数中x,y为矩形左上角顶点坐标，width,height为矩形的宽和高。










