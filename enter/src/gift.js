(function(){

	var requestAnimFrame = (function(){
		return window.requestAnimationFrame	||
		window.webkitRequestAnimationFrame  ||
		window.mozRequestAnimationFrame	 	||
		window.msRequestAnimationFrame		||
		 function(callback){
			window.setTimeout(callback,1000/60);
		};
	})();

	var gift = {};

	//检测浏览器是否支持canvas和requestAnimationFrame
	gift.support = (function(){				
    	return (!!document.createElement('canvas').getContext) && (!!(window.requestAnimationFrame	|| window.webkitRequestAnimationFrame  || window.mozRequestAnimationFrame || window.msRequestAnimationFrame));
	})();

	//礼物列表
	gift.list = {};

	//获取服务器zip包
	gift._getBinaryContent = (function(){
		var JSZipUtils = {};
		// just use the responseText with xhr1, response with xhr2.
		// The transformation doesn't throw away high-order byte (with responseText)
		// because JSZip handles that case. If not used with JSZip, you may need to
		// do it, see https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
		JSZipUtils._getBinaryFromXHR = function (xhr) {
		    // for xhr.responseText, the 0xFF mask is applied by JSZip
		    return xhr.response || xhr.responseText;
		};

		// taken from jQuery
		function createStandardXHR() {
		    try {
		        return new window.XMLHttpRequest();
		    } catch( e ) {}
		}

		function createActiveXHR() {
		    try {
		        return new window.ActiveXObject("Microsoft.XMLHTTP");
		    } catch( e ) {}
		}

		// Create the request object
		var createXHR = window.ActiveXObject ?
		    /* Microsoft failed to properly
		     * implement the XMLHttpRequest in IE7 (can't request local files),
		     * so we use the ActiveXObject when it is available
		     * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
		     * we need a fallback.
		     */
		    function() {
		    return createStandardXHR() || createActiveXHR();
		} :
		    // For all other browsers, use the standard XMLHttpRequest object
		    createStandardXHR;



		JSZipUtils.getBinaryContent = function(path, callback) {
		    /*
		     * Here is the tricky part : getting the data.
		     * In firefox/chrome/opera/... setting the mimeType to 'text/plain; charset=x-user-defined'
		     * is enough, the result is in the standard xhr.responseText.
		     * cf https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data_in_older_browsers
		     * In IE <= 9, we must use (the IE only) attribute responseBody
		     * (for binary data, its content is different from responseText).
		     * In IE 10, the 'charset=x-user-defined' trick doesn't work, only the
		     * responseType will work :
		     * http://msdn.microsoft.com/en-us/library/ie/hh673569%28v=vs.85%29.aspx#Binary_Object_upload_and_download
		     *
		     * I'd like to use jQuery to avoid this XHR madness, but it doesn't support
		     * the responseType attribute : http://bugs.jquery.com/ticket/11461
		     */
		    try {

		        var xhr = createXHR();

		        xhr.open('GET', path, true);

		        // recent browsers
		        if ("responseType" in xhr) {
		            xhr.responseType = "arraybuffer";
		        }

		        // older browser
		        if(xhr.overrideMimeType) {
		            xhr.overrideMimeType("text/plain; charset=x-user-defined");
		        }

		        xhr.onreadystatechange = function(evt) {
		            var file, err;
		            // use `xhr` and not `this`... thanks IE
		            if (xhr.readyState === 4) {
		                if (xhr.status === 200 || xhr.status === 0) {
		                    file = null;
		                    err = null;
		                    try {
		                        file = JSZipUtils._getBinaryFromXHR(xhr);
		                    } catch(e) {
		                        err = new Error(e);
		                    }
		                    callback(err, file);
		                } else {
		                    callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null);
		                }
		            }
		        };

		        xhr.send();

		    } catch (e) {
		        callback(new Error(e), null);
		    }
		};

		return JSZipUtils.getBinaryContent;

	})();
 
 	// 运行豪华礼物动画接口
	gift.animate = function(canvas , option , callback){
		var ctx = canvas.getContext("2d");
		var giftid = option.giftid;
		var index = 0;
		var animationtime, length, step, imgWidth, imgHeight, imgList;
		var startTime = 0;
		

		if(!ctx){
			callback(new Error("your browser don't support canvas"));
			return false;
		}
		
		if(gift.list[giftid] && gift.list[giftid].images.length > 0){
			 animationtime = option.animationtime;
			 length = gift.list[giftid].images.length;
			 step = animationtime/length;
			 imgList =  gift.list[giftid].images;
			 imgWidth = imgList[0].width;
			 imgHeight = imgList[0].height;
			 canvas.width = imgWidth;
			 canvas.height = imgHeight;
			requestAnimFrame(play);

		}else{
			var obj = gift.list[giftid] = {};
			obj.name = option.name;
			obj.animationtime = option.animationtime; 
			obj.images = [];

			gift._getBinaryContent(option.fileurl, function(err, data) {
			    if(err) {
			    	 gift.list[giftid] = null;
			        callback(err); // or handle err
			        return;
			    }
			    var zip = new JSZip();
			    zip.loadAsync(data)
			    .then(function(zip){
			    	var files = zip.file(/^[0-9]{1,}.png$/);
			    	var promiseList = [];

			    	files.sort(function(v1, v2){
			    		return parseInt(v1.name) - parseInt(v2.name)
			    	});
			    	for(var i = 0,len = files.length;i<len;i++){
			    		promiseList.push(files[i].async("base64").then(function(data){return data}));

			    	}
				   return JSZip.external.Promise.all(promiseList)
				    .then(function(list){
				    	for(var i=0 ; i < list.length; i++){
				    		var img = new Image();
			    			img.src = "data:image/png;base64," + list[i];
			    			obj.images[i] = img;
				    	}
				    },function error(e) {
					    // handle the error
					    gift.list[giftid] = null;
					    zip = null;
					    
					});

			    })
			    .then(function(){
			   		animationtime = option.animationtime;
					length = gift.list[giftid].images.length;
					if(length >0){
						step = animationtime/length;
						imgList =  gift.list[giftid].images;
						imgWidth = imgList[0].width;
						imgHeight = imgList[0].height;
						canvas.width = imgWidth;
						canvas.height = imgHeight;
				    	requestAnimFrame(play);
					}else{
						gift.list[giftid] = null;
						throw new Error("can't find images");
					}
					
			    },function error(e) {
					    // handle the error
					    gift.list[giftid] = null;
					    zip = null;
					    // callback(e);
					    
				})
				.then(function(){
					zip = null;
				},function error(e) {
					    // handle the error
					    gift.list[giftid] = null;
					    zip = null;
					    callback(e);
					    
				});  

			});

		}

		function play(timestamp){
			if(!startTime){
				startTime = timestamp;
			}
			index = Math.floor((timestamp - startTime)/step);

			if(index < length){
				var img = imgList[index];

				ctx.clearRect(0, 0, canvas.width, canvas.height);
	    		ctx.drawImage(img, 0, 0,imgWidth,imgHeight,0,0,canvas.width,canvas.height);	
			}
			if(index >= length){
				ctx.clearRect(0, 0, canvas.width, canvas.height);
	    		callback();
	    	}else{
	    		requestAnimFrame(play);
	    	}			
		}
	}


	//神豪入场特效
	gift.enter = (function(){

		var enter = {
			ctx: null,
			canvas: null,
			type: null,
			width: 750,
			height: 1334,
			screenTpy: 1 //1:竖屏 2:横屏

		};
		
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
		var shenhao = {				//神豪绘图控制
			images:[],
			X: 123,
			Y: 308,
			// X1: 934,
			// Y1: 308,
			X1: 539,
			Y1: 155,
			interval: 40,
			draw: function(t){
				var index = Math.floor(t/this.interval);

				if(index >= this.images.length){
					index = this.images.length-1;
				}
				if(enter.screenTpy == 1){
					enter.ctx.drawImage(this.images[index], this.X, this.Y);
				}else{
					enter.ctx.save();
					enter.ctx.scale(1.5, 1.5);
					enter.ctx.drawImage(this.images[index], this.X1, this.Y1);
					enter.ctx.restore();
				}
				
				
			}
		};
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

		var ctrl = {							//整体透明度控制
				startTime: 6960,
				interval: 40,
				opacity: 1,
				draw: function(t){
					if(t > this.startTime){
						var index = parseInt((t - this.startTime)/this.interval);
						this.opacity = 1 - index/25;
					}else{
						this.opacity = 1;
					}

					enter.canvas.style.opacity = this.opacity;
				}
		};

		return enter.animate;


	})();

	//辅助函数
	function getStyle (obj,attr) {  //获取样式
        if( obj.currentStyle ){
            return obj.currentStyle[attr];
        }
        else{
            return getComputedStyle(obj)[attr];
        }
    }


	
	window.canvasgift = gift;


})();