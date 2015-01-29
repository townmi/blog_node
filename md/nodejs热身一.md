title: NODEJS热身一
date: 2014-09-13 22:56:09
tags: ["javascript","nodejs"]
categories:	nodejs
---
### NODEJS起源 ###
nodejs的诞生与javascript的崛起是有着本质的联系的，用javascript这一弱类型语言去写后端服务，已经是一段历史了。但是nodejs之所以能力揽狂澜，google的V8引擎是功不可没，当然越来越多的程序员投身web前端技术开发，也是给nodejs的发展奠定的人才基础。
nodejs诞生于2009年，Ryan Dahl将V8引入后端，将C++和javascript两种语言结合，创造出一门新的后端技术－－NODEJS。
2010年，随着ECMAScript5的发布，nodejs的发展的非常快。越拉越多的公司都加入nodejs开发队伍中来，涌现出一大批优秀的项目。
### NODEJS的特点 ###
nodejs的最大的特点：事件驱动，这跟浏览器段的javascript的事件驱动很像，事件驱动很好的支持了nodejs的I/O大并发。当然不得不说的就是nodejs的单线程，在单线程的基础之上加入事件驱动，很好的避免的阻塞操作。非阻塞I/O就是nodejs的一大特色，当然随着nodejs引入child_process模块，单线程的短板得到很大的改善。