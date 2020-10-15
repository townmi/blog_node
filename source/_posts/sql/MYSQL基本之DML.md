---
title: MYSQL基本之DML
date: 2020-10-16 22:31:56
tags:
- Mysql
categories:
- 数据库
---

### MYSQL基本之DML
作用：用来操作数据库中的表对象，主要包括的操作有：INSERT，UPDATE，DELETE
```sql
  #给表中添加数据
  INSERT INTO ... 
  #修改表中的数据
  UPDATE table_name SET ... 
  #删除表中的数据
  DELETE FROM table_name WHERE <condition>; 
  #注：<condition>:表示DML操作时的条件
```
<!-- more -->

### `INSERT`
语法:
```sql
  INSERT INTO 表名[(字段1,字段2,字段3,...)] VALUES('值1','值2','值3')
```