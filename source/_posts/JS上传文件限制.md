---
title: JS上传文件限制
date: 2018-09-09 22:31:56
tags:
- JS
categories:
- 前端
---

### JS上传文件限制
#### input accept 属性
`<input type="file" />`可以通过 `acccept`属性来限制上传文件的类别
```html
  <input type="file" accept="image/png, image/jpeg" />
  <input type="file" accept="image/png" />
  <input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
```

<!-- more -->

#### 通过file οnchange处理
通过`<input type="file" />`的`change`事件来处理文件的大小限制或者文件后缀限制
```html
  <input input="file" id="file" name="file" οnchange="fileChange(this);" />
```
```js
  const fileChange = (target) => {
    var fileSize = 0;
    fileSize = target.files[0].size;
    var size = fileSize / 1024;
    if ( size > 1000) {
      alert("附件不能大于1M");
      return;
    }
    var name = target.value;
    var fileName = name.substring(name.lastIndexOf(".")+1).toLowerCase();
    if (fileName !="jpg" && fileName !="jpeg" && fileName !="pdf" && fileName !="png" && fileName !="dwg" && fileName !="gif" && fileName !="xls" && fileName !="xlsx" && fileName !="word" && fileName !="doc"&& fileName !="docx" && fileName !="txt"){
      alert("请选择图片格式文件上传(jpg,png,gif,dwg,pdf,gif等)！");
      return;
    }
  }
```

### plupload文件上传插件
[`plupload.js`](!https://github.com/moxiecode/plupload/wiki/Uploader)是一个用来处理上传文件的前端插件，可以通过参数配置来实现各种上传文件限制、上传环境、分片上传、上传进度以及上传状态的追踪.

```html
  <button id="file">上传文件</button>
```
```js
  import plupload from 'plupload';
  const uploader = new plupload.Uploader({
    // chunk_size: 1048576, // 1024 * 1024 分片上传
    filters: {
      //png、jpg、wps、xlsx、xls、eml、rtf、docx、doc、txt、pdf、htm、html、mht
      mime_types : [
        { title : "Image files", extensions : "jpg,jpeg,png,JPG,JPEG,PNG" },
        { title : "Document files", extensions : "html,htm,pdf,doc,docx,txt,rtf,eml,xls,xlsx,wps,mht" }
      ],
      prevent_duplicates: true,
      max_file_size: '1mb'
    },
    runtimes: 'html5,flash,silverlight,html4',
    browse_button: 'file',
    multi_selection: false,
    init: {
      FilesAdded: function (up, files) {
      },
      UploadProgress: function (up, file) {
      },

      FileUploaded: function (up, file, info) {
      },
      Error: function (up, err) {
        alert(err);
      }
    }
  });
  uploader.init();
```