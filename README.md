# 知识分享：canvas实现明星、神豪入场特效

不用说，HTML5添加的最受欢迎的就是canvas元素，非常强大有意思，在这我跟前端的同学们分享一下canvas明星、神豪入场特效的实现，希望大家共同学习、共同进步，多多分享自己学到的知识点，在此本人先抛块砖，技术水平有限，有错误的地方还请各位同学指出更正！

## 一、canvas基本知识点

目前IE9+、Firefox 1.5+、Safari 2+、Opera 9+、Chrome、iOS版Safari以及Android版WebKit都在某种程度上支持\<canvas>

### 1、基本用法

```
<canvas id="drawing" width="200" height="200">这是一块画布。</canvas>
```
上述\<canvas>元素具有width和height属性，指的是画布的大小。与其他元素一样\<canvas>元素对应的DOM对象也有width和height属性，这二者之间的关系大家自己研究一下吧。

要在这块画布上绘图，首先需要取得绘图的上下文，需要调用getContext()方法并传入“2d”。

```
var drawing = document.getElementById("drawing");

//判断是否支持canvas
if(drawing.getContext){
    var ctx = drawing.getContext("2d");
    // code
}
```
 
    
