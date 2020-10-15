---
title: MYSQL基本之DDL
date: 2020-10-15 22:31:56
tags:
- Mysql
categories:
- 数据库
---

### MYSQL基本之DDL
数据定义语句，定义了数据库、表、索引等对象的定义。常用语句包含：CREATE、DROP、ALTER。

<!-- more -->

### 数据库相关

1. 新建数据库
```sql
  CREATE DATABASE `XXX` DEFAULT CHARSET=UTF8;
```

2. 删除数据库
```sql
  DROP DATABASE `xxx`;
```

### 表相关

1. 创建数据表
```sql
  create table [if not exists] `表名`(
    '字段名1' 列类型 [属性][索引][注释],
    '字段名2' 列类型 [属性][索引][注释],
    #...
    '字段名n' 列类型 [属性][索引][注释]
  )[表类型][表字符集][注释]
```

2. 创建一个新表，与原表的表结构相同，但是并无数据
```sql
  create table `table_name` like `table_name1`;
```

3. 修改表结构
```sql
  alert table  `old_table_name` RENAME AS `new_table_name`; # 修改表名
  alert table `table_name` MODIFY  col_name column_definition [FIRST | AFTER col_name]; # 修改字段类型
  alert table `table_name` ADD col_name column_definition [FIRST | AFTER col_name]; # 增加字段
  alert table `table_name` DROP col_name; # 删除字段
  alert table `table_name` CHANGE old_col_name new_col_name column_definition [FIRST|AFTER col_name]; # 修改字段名
```

4. 查看表结构
```sql
  DESC `table_name`;
```

5. 删除表
```sql
  DROP TABLE [IF EXISTS] `table_name`; # [IF EXISTS] 可选
```

### 类型

#### 值类型

| 类型     | 说明  |  取值范围  | 存储需求  |
| --------   | --------  | --------  |  --------  |
| tinyint   |  非常小的数据 |  有符号: -2^7 ~ 2^7-1, 无符号: 0 ~ 2^8-1   |  1字节  |
| smallint  |  较小的数据 |  有符号: -2^15 ~ 2^15-1, 无符号: 0 ~ 2^16-1   |  2字节  |
| mediumint  |  中等大小的数据 |  有符号: -2^23 ~ 2^23-1, 无符号: 0 ~ 2^24-1  |  3字节  |
| int  |  标准整数 |  有符号: -2^31 ~ 2^31-1, 无符号: 0 ~ 2^32-1  |  4字节  |
| bigint  |  较大的整数 |  有符号: -2^63 ~ 2^63-1, 无符号: 0 ~ 2^64-1  |  8字节  |
| float  |  单精度浮点数 |    |  4字节  |
| double  |  双精度浮点数 |    |  8字节  |
| decimal  |  字符串形式的浮点数,一般用于和钱相关 |    |  4字节  |

#### 字符串类型

| 类型     | 说明  |  最大长度  | 
| --------   | --------  | --------  | 
| char[(M)]   |  固定长字符串,检索快但是非空间, 0<=M<=255 |  M字符   | 
| varchar[(M)]   |  可变长度字符串, ， 0<=M<=65535 |  可变长度   | 
| tinyText  |  微型文本 |  2^8 - 1字节  | 
| text  |  文本串 |  2^16 - 1字节  | 

#### 日期和时间类型

| 类型     | 说明  |  取值范围  | 
| --------   | --------  | --------  | 
| DATE  |  YYYY-MM-DD, 日期格式  |  1000-01-01 ~ 9999-12-32  |
| TIME  |  HH:mm:ss, 时间格式  |  -838:59:59 ~ 838:59:59   |
| DATETIME  |  YYYY-MM-DD HH:mm:ss |  1000-01-01 00:00:00 ~ 9999-12-31 23:59:59   |
| TIMESTAMP  |  时间戳  |     |
| YEAR  |  YYYY 格式的年份值 |  1901~2155   |

#### NULL 值

- 理解为"没有值"或者"未知的值"
- 不要使用`NULL`进行算术运算,结果还是`NULL`

### 字段属性

#### `UNSIGNED`

- 无符号的
- 声明改字段的数据不允许有负数

#### `ZEROFILL`
- 0填充
- 不足的位数用0来填充, 例如`int(3`, 7 就是 007;

#### `AUTO_INCREMENT`
- 自动增长的，没添加一条数据，自动在上一个记录上加1(1是步长，可以修改)
- 通常用于设置**主键**,并且为整数类型
- 可定义起始值和步长, 当前表设置步长(AUTO_INCREMENT=100) : 只影响当前表
- `SET @@auto_increment_increment=5;` 影响所有使用自增的表(全局)

#### `NULL`、`NOT NULL`
- 默认为NULL , 即没有插入该列的数值
- 如果设置为NOT NULL , 则该列必须有值

#### `DEFAULT`
- 默认的, 用于设置默认值
- 例如,性别字段,默认为"男", 否则为"女"; 若无指定该列的值 , 则默认值为"男"的值