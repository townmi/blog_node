---
title: Spring中使用Kafka
date: 2021-01-05 19:37:38
tags:
- Java
categories:
- Java
---

### Spring中使用Kafka
SpringBoot整合Kafka实现发布订阅

<!-- more -->

### 添加依赖库

  ```groovy
    // kafaka消息队列SDK
    // https://mvnrepository.com/artifact/org.springframework.kafka/spring-kafka
    compile group: 'org.springframework.kafka', name: 'spring-kafka', version: '2.6.4'
  ```

### 配置文件

```yaml
  spring:
    kafka:
      bootstrap-servers:
        - 127.0.0.1:9092
      consumer:
        group-id: 0
      template:
        default-topic: test
      listener:
        concurrency: 5
```

### 创建消费者


```java
  package com.test.bean;

  import org.apache.kafka.clients.consumer.ConsumerRecord;
  import org.springframework.kafka.annotation.KafkaListener;
  import org.springframework.stereotype.Component;

  @Component
  public class KafkaConsumerListener {
    @KafkaListener(topics = "test")
    public void listener(ConsumerRecord<?, ?> cr) {
      Object key = cr.key();
      String topic = cr.topic();
      Object value = cr.value();
      System.out.println(key + ":>>" + topic + ":" + value);
    }
  }
```

### 模拟生产者

```java

  package com.test.controller;

  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.kafka.core.KafkaTemplate;
  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.RestController;

  @RestController
  public class SampleController {
    @Autowired
    private KafkaTemplate<String, String> template;

    @GetMapping("/send")
    String send(String topic, String key, String data) {
      template.send(topic, key, data);
      return "success";
    }
  }
```