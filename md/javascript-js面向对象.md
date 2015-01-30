title: JS面向对象
date: 2014-05-21 21:32:08
tags: 面向对象
categories: javascript
---
### 我对JS面向对象的一些看法 ###
----------
面向对象是一个听起来很抽象的概念，以至于我顿时不知道该写什么了。上上个礼拜，写了个小游戏，给老师看了一下，老师给提出用面向对象的编程思想去写，面向对象可以大幅度的降低代码的耦合度。今天闲着没事干，看了老师录的面向对象那一块的视频，终于有了一点看法。
扯了那么多，得来点代码消化消化。
```
	var oDate = new Date();
	var obj = new Object();
	var arr = new Array();
```
上面是我们在JS中经常创建对象的方式，当然下面两种咱们基本不用，咱们拿来看看。我们要生成一个对象，我们都是new一个Xxx()出来的，就好比一个厨师要做一个番茄炒蛋，他肯定要把鸡蛋和番茄都new出来才能做菜。但是JS本身并不是菜市场，我想要什么就new什么，但是JS提供了构造函数该我们用，就好比菜市场肯定没有番茄鸡蛋虾米酱，我们只能自己去做了。先看看构造函数： 
<!-- more -->
```
	function Sauce(a,b,c){
		this.a = a;
		this.b = b;
		this.c = c;
		this.getSauce = function(){
			return this.a+this.b+this.c+"sauce";
		}
	}
	var tes = new Sauce("tomato","egg","shrimp");
	console.log(tes.getSauce());
```
这样番茄鸡蛋虾米酱，够吃一年了。Sauce这个构造函数就像是一个机器一样，你穿什么进去，它就给你捣鼓什么。突然吃了半年的番茄鸡蛋虾米酱，我们想换换口味了，能不能就拌两种食材呢。我们可以直接在构造函数里面在加一段`this.getTwoSauce = function(){···}`，当然这样做没问题。但是咱们不想把这个机器拆的七零八落的，在装个什么上去，麻烦，机器还容易拆坏。JS给我们提供了一个很不错的工具。那就是prototype原型。
```
	Sauce.prototype.getTwoSauce = function(){
		return this.a+this.b+"sauce";
	}
```
你会发现我们的机器可以拌两种酱了。