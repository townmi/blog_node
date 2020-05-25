---
title: MYSQL常用
date: 2020-02-19 22:31:56
tags:
- Mysql
categories:
- 数据库
---

### MYSQL常用
汇总下经常出现的`sql`用法

<!-- more -->

#### 基本语法

1. 查询
```sql
  SELECT * FROM `table_name`;
```

2. 查询重复字段统计重复个数
```sql
  SELECT `key`, COUNT(*) as `total` FROM `table_name` GROUP BY `key` HAVING COUNT(1) > 1;
```