title: THIS的只读操作
date: 2014-05-23 14:42:30
tags: this
categories: javascript
---
### this是一个只读的对象 ###
----------
在我们写前端效果的时候，几乎不可能不去跟this打交道，this太方便了，相当方便，我在写代码的时候总是会往this上面靠。但是要是想把握好this的指向性，写代码的时候就要非常的细心。当然前提条件是你对this有足够的了解。先来看看this的常用场景。
出入JS，我们经常写出下面的代码：
```
	<script type="text/javascript">
		window.onload = function (){
			var aLi = document.getElementsByTagName('li');
	 		for( var i = 0; i < aLi.length; i++){
	 			aLi[i].onclick = function(){
	 				this.style.background = 'red';
	 			}
	 		}
		}
	</script>
```
<!-- more -->
在上面的代码中，我们发现this在Li元素的点击事件中起到了最为关键的作用，这个时候this就指向了发生点击事件的对象。一般情况下，在事件函数内，this都指向发生事件的对象。这也很容易理解。
想必对JS作用域有所了解的同学，都知道JS里面有个叫闭包的东西。我们看下面的代码就清楚了。
```
	function fn1(){
		var a = {name : "laodie"};
		function fn2(){
			var b = "erzi";
			alert(a.name);
		}
		fn2();
		alert(b);
	}
 	fn1();
```
我们会发现在fn2中并没有声明a变量，但是程序并没有报错，反而把fn1里面的a弹出来了；但是fn1却没有访问到b，直接报错`b is not defined`。这就是闭包：简单的说就是老爸的家儿子可以随意进出，想拿什么就拿什么；不过儿子的家，老爸连门都碰不着,(坑爹吧)。但是我们this讲的好好的为什么突然扯到闭包上面呢。其实，下面的代码说明了我的目的：
```
	window.onload = function(){
		var aLi = document.getElementsByTagName('li');
	 	for( var i = 0; i < aLi.length; i++){
	 		aLi[i].onclick = function(){
	 			this.style.background = 'red';
	 			(function(){alert(this)})();
	 		}
	 	}
	}
```
我们会发现原来我们想了利用闭包，在子函数内部使用li元素的，可是子函数内部的this却指向了window。我们发现虽然儿子可以随意访问老爸的地盘，可以想拿什么就拿什么。不过儿子不能把老爸从老爸的家里轰出来吧。所以我的得出一个结论：this只有在本函数内部其实际指向性才有效。当然子函数的this始终指向window。当然我们要想访问父级函数的this并不是没有办法，我们可以把父级的this传递给一个变量`var _this = this`，这样我们在子级函数内部就可以访问了。
当然当我们使用定时器的时候，我们在使用this时候，也会遇到同上的问题，this指向了window。办法也是将this传递给其他变量，同过变量去操作this。
我们在采用构造函数生成对象的时候，我们也碰到this：
```
	function This(n,a){
		this.name = n;
		this.age = a
	}
	var _this = new This('towne',24);
	alert(_this.name+"今年"+_this.age+"岁");
```
我们发现在构造函数内部，this是不具备指向性的，只有new一个实例化的对象后this才会具有指向性，而且就是指向new出来的实例对象。
当然，大晚上的咱们目的不是在关注this的指向性。咱们在写代码的是时候，咱们从来没有写过这样的代码吧`this = null`；当然以后也千万不要写；我们虽然频繁的使用this，可是千万要记住this我们可以修改它的方法和属性；不过我们不能对它本身进行操作。就是说**this**本身是只能读取的，不能进出写操作。而`this.className`这些this下面的属性和方法，我们是可以读取和写操作的。大晚上的热的一米。2014/5/24 0:11:56 

