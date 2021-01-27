---
title: google服务账号认证和授权页Java
date: 2021-01-12 19:37:38
tags:
- Java
categories:
- Java
---

### google服务账号认证和授权页Java
本文章用来记录如何使用google服务账号，来调用google API SDK

<!-- more -->
#### 简单说明
google api 授权和认证官方[参考](https://developers.google.com/api-client-library/java/google-oauth-java-client/oauth2)。本文章是针对服务账号最简单的事例.

#### 添加依赖库

```groovy
  // 认证和授权页SDK
  compile 'com.google.api-client:google-api-client:1.23.0'
  // google calendar SDK
  compile 'com.google.apis:google-api-services-calendar:v3-rev305-1.23.0'
```

#### 案例

```java
  package com.test.service.impl;

  import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
  import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
  import com.google.api.client.http.HttpTransport;
  import com.google.api.client.http.javanet.NetHttpTransport;
  import com.google.api.client.json.JsonFactory;
  import com.google.api.client.json.jackson2.JacksonFactory;
  import com.google.api.client.util.DateTime;
  import com.google.api.services.admin.directory.DirectoryScopes;
  import com.google.api.services.calendar.Calendar;
  import com.google.api.services.calendar.CalendarScopes;
  import com.google.api.services.calendar.model.Event;
  import com.google.api.services.calendar.model.Events;
  import com.test.service.CalendarService;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Service;

  import java.io.ByteArrayInputStream;
  import java.io.IOException;
  import java.security.GeneralSecurityException;

  import java.util.Collections;
  import java.util.List;

  @Service
  public class CalendarServiceImpl implements CalendarService {

    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final List<String> SCOPES = Collections.singletonList(CalendarScopes.CALENDAR);
    //  private static final List<String> SCOPES = Collections.singletonList(DirectoryScopes.ADMIN_DIRECTORY_RESOURCE_CALENDAR_READONLY);

    @Override
    public void loadCalendar() throws GeneralSecurityException, IOException {
      // 配置凭据信息可以使用properties来存储
      String authString = "";
      String delegatedMail = "test@test.com";
      // HTTP_TRANSPORT
      NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();

      // 构造 GoogleCredential
      ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(authString.getBytes());
      GoogleCredential init = GoogleCredential.fromStream(byteArrayInputStream);
      HttpTransport httpTransport = init.getTransport();
      JsonFactory jsonFactory = init.getJsonFactory();

      GoogleCredential creds = new GoogleCredential.Builder()
        .setTransport(httpTransport)
        .setJsonFactory(jsonFactory)
        .setServiceAccountId(init.getServiceAccountId())
        .setServiceAccountPrivateKey(init.getServiceAccountPrivateKey())
        .setServiceAccountScopes(SCOPES)
        .setServiceAccountUser(delegatedMail)
        .build();

      // Calendar SDK 服务的实例
      Calendar calendar = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, creds).build();

      DateTime now = new DateTime(System.currentTimeMillis());

      // test.com_188buoemf9s10hrkic4pss31h1nh2@resource.calendar.google.com calendarID下的事件
      Events events = calendar.events().list("test.com_188buoemf9s10hrkic4pss31h1nh2@resource.calendar.google.com")
        .setMaxResults(10)
        .setTimeMin(now)
        .setOrderBy("startTime")
        .setSingleEvents(true)
        .execute();
      List<Event> items = events.getItems();
      if (items.isEmpty()) {
        System.out.println("No upcoming events found.");
      } else {
        System.out.println("Upcoming events");
        for (Event event : items) {
          DateTime start = event.getStart().getDateTime();
          if (start == null) {
            start = event.getStart().getDate();
          }
          System.out.printf("%s (%s)\n", event.getSummary(), start);
        }
      }

    }

  }


```