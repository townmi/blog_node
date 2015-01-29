title: Object
date: 2014-06-22 14:19:17
tags: object
categories: javascript
---
### JS对象 ###

----------

前几天在HTML5群里头有人问道：Object.defineProperties();当时没太留意，今天想起来，于是翻了一些博客，看了几眼，Object在ECMAScript5中扩展了许多功能；今天就来聊聊这些功能


1.Object.create()
create方法是Object构造函数底下的私有方法。一般我们创建一个对象都是`var o = {"a":1}`;这样就相当与`new Object()`；当然我们还有第三种方法来创建一个对象:

```
	<script type="text/javascript">
	var  o = Object.create({
		"name" : "tonwe",
		"age" : 24,
		"work" : function(){
					return "working....";
				}
	})
	</script>
```
当然我们一般情况下不会使用到后面两种方式；使用自定义对象的方式不仅简单，性能上也优越。