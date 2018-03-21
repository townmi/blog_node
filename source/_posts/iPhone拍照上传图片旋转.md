---
title: iPhone拍照上传图片旋转
date: 2018-03-21 10:32:57
tags:
- JS
categories:
- 前端
---

### 图片上传

经常遇到前端拍照上传照片这样的需求, 大多数人直接加下入下面的代码，就完事了。
```html
<input type="file" multiple accept='image/*' onChange={(e) => { this.handleFileUpload(e) }} />
```

```javascript
handleFileUpload(e) {
  const _files = e.target.files;
  let fd = new FormData();

  _files.forEach(cell => {
    fd.append('file', cell);
  });

  uploadFile(fd).then(res => {
  }).catch(error => {
  });
}
```

<!--more-->

但是当你的测试同学细心点，你就会遇到来自iPhone 的BUG。
iPhone 拍出来的照片有点特殊，它的照片包含了[EXIF信息](https://zh.wikipedia.org/wiki/EXIF), EXIF信息里面**Orientation**, 会影响照片的方向:

![Orientation](/uploads/20180322/1.jpg)
一般情况下**Orientation** 的值会是1, 或者-1(Android)。但是IOS 会出现 6、3等情况。这些特殊的信息，会导致图片上传后旋转。

![transform](/uploads/20180322/2.jpg)
那么如何解决这样的问题呢？

### 解决IOS orientation 的旋转问题

#### 没错，直接抹除EXIF信息

直接清除EXIF信息，可以快速的解决问题，这里我们需要引入较新的WEB API: `FileReader` 和 `DataView`
``` javascript
// 首先，files 是上传的图片 
cosnt files = e.target.files;
let fr = new FileReader();
fr.onload = (e) => {
  let dv = new DataView(this.result);
  let offset = 0, recess = 0;
  let pieces = [];
  let i = 0;
  if (dv.getUint16(offset) == 0xffd8) {
    offset += 2;
    let app1 = dv.getUint16(offset);
    offset += 2;
    while (offset < dv.byteLength) {
      if (app1 == 0xffe1) {
        pieces[i] = { recess: recess, offset: offset - 2 };
        recess = offset + dv.getUint16(offset);
        i++;
      } else if (app1 == 0xffda) {
        break;
      }
      offset += dv.getUint16(offset);
      let app1 = dv.getUint16(offset);
      offset += 2;
    }
    if (pieces.length > 0) {
      let newPieces = [];
      pieces.forEach(function (v) {
        newPieces.push(this.result.slice(v.recess, v.offset));
      }, this);
      newPieces.push(this.result.slice(recess));
      let br = new Blob(newPieces, { type: 'image/jpeg' });
      // br 就是已经清除了EXIF 信息的新图片
    }
  }
};

fr.readAsArrayBuffer(files[0]);
```

#### 如果你需要保留EXIF信息, 当然也可以配合Canvas来处理

同样的也需要引入较新的WEB API: `FileReader` 和 `DataView`:

``` javascript
// 第一步 检查 orientation
  checkOrientation(File file)
// 使用canvas 
ctxt.rotate(n * Math.PI / 180);
```

强烈建议清除 EXIF信息，简单粗暴.