---
title: Spring使用Redis处理消息订阅
date: 2021-01-07 19:37:38
tags:
- Java
categories:
- Java
---

### Spring使用Redis处理消息订阅
前面我们了解了使用`kafka`来订阅消息，但是`Kafka`太'贵'了,今天我们来选择`redis`来实现消息的订阅处理

<!-- more -->

### 添加依赖库

```groovy
  // https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-data-redis
  compile group: 'org.springframework.boot', name: 'spring-boot-starter-data-redis', version: '2.4.1'
```

### 配置

```yaml
  spring:
    redis:
      database: 0
      host: 127.0.0.1
      port: 6379
      password:
      ssl: false
      jedis:
        pool:
          max-idle: 8
          max-active: 8
          max-wait: 60000
```

### 创建消息POJO

```java
  package com.test.pojo;

  import lombok.AllArgsConstructor;
  import lombok.Data;
  import lombok.NoArgsConstructor;

  import java.util.Date;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public class RedisMessage {
    private String publisher;
    private String content;
    private Date createTime;
  }
```

### 创建订阅

```java
  package com.test.component;

  import com.test.pojo.RedisMessage;
  import lombok.extern.slf4j.Slf4j;
  import org.springframework.stereotype.Component;

  @Component
  @Slf4j
  public class RedisMessageSubscriber {
    public void onMessage(RedisMessage message, String pattern) {
      log.info(message.toString(), pattern);
    }
  }

```

### 创建配置类

```java
  package com.test.config;

  import com.fasterxml.jackson.annotation.JsonInclude;
  import com.fasterxml.jackson.databind.ObjectMapper;
  import com.test.component.RedisMessageSubscriber;
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
  import org.springframework.data.redis.core.RedisTemplate;
  import org.springframework.data.redis.listener.PatternTopic;
  import org.springframework.data.redis.listener.RedisMessageListenerContainer;
  import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
  import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
  import org.springframework.data.redis.serializer.StringRedisSerializer;

  @Configuration
  public class RedisConfig {

    @Bean
    public Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer() {
      Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
      ObjectMapper mapper = new ObjectMapper();
      mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
      mapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
      jackson2JsonRedisSerializer.setObjectMapper(mapper);
      return jackson2JsonRedisSerializer;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory connectionFactory, Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer) {
      RedisTemplate<String, Object> template = new RedisTemplate<>();
      template.setConnectionFactory(connectionFactory);

      StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
      template.setKeySerializer(stringRedisSerializer);
      template.setHashKeySerializer(stringRedisSerializer);

      template.setValueSerializer(jackson2JsonRedisSerializer);
      template.setHashValueSerializer(jackson2JsonRedisSerializer);
      template.afterPropertiesSet();

      return template;
    }

    @Bean
    public RedisMessageSubscriber subscriber() {
      return new RedisMessageSubscriber();
    }

    @Bean
    public MessageListenerAdapter listener(Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer, RedisMessageSubscriber subscriber) {
      MessageListenerAdapter adapter = new MessageListenerAdapter(subscriber, "onMessage");
      adapter.setSerializer(jackson2JsonRedisSerializer);
      adapter.afterPropertiesSet();
      return adapter;
    }

    @Bean
    public RedisMessageListenerContainer container(LettuceConnectionFactory connectionFactory, MessageListenerAdapter adapter) {
      RedisMessageListenerContainer container = new RedisMessageListenerContainer();
      container.setConnectionFactory(connectionFactory);
      container.addMessageListener(adapter, new PatternTopic("topic:test"));
      return container;
    }
  }

```