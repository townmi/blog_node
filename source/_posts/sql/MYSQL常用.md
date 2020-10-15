---
title: MYSQL常用
date: 2020-10-08 22:31:56
tags:
- Mysql
categories:
- 数据库
---

### MYSQL常用
汇总下经常出现的`sql`用法

<!-- more -->

### 结构化查询语句分类

数据库的结构化查询语句一般分下面4大类

| 名称        | 解释  |  命令  | 
| --------   | -----:   | :-----:   | 
| DDL(数据定义语言)   | 定义和管理数据对象，如数据库、数据表  |  CRETAE、DROP、ALTER |
| DML(数据操作语言)   | 用于操作数据库对象中所包含的数据  |  INSERT、UPDATE、DELETE |
| DQL(数据查询语言)   | 用于查询数据库数据  |  SELECT |
| DCL(数据控制语言)   | 用于管理数据库的语言、包括管理权限和数据更改  |  GRANT、COMMIT、ROLLBACK |


### 基本语法

1. 查询
```sql
  SELECT * FROM `table_name`;
```

2. 查询重复字段统计重复个数
```sql
  SELECT `key`, COUNT(*) as `total` FROM `table_name` GROUP BY `key` HAVING COUNT(1) > 1;
```