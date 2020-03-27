---
title: TypeScript 单元测试
date: 2019-01-19 19:37:38
tags:
- TypeScript
- Mocha
- Jest
- Jasmine
categories:
- 前端
---

今天，我们将研究如何使用TypeScript进行单元测试以及流行的框架：Mocha / Chai，Jasmine或Jest。 我们已经知道目前流行的框架，并希望在TypeScript中编写单元测试！ 我们将介绍在TypeScript中支持单元测试所需的更改。 如果没有，可以参考每个库的文档。 在TypeScript中编写测试用例与在JavaScript中编写测试用例非常相似。 最重要的部分是进行设置，以便使用此库可以执行用TypeScript编写的测试用例。
<!-- more -->
源代码可从[https://github.com/chiragrupani/TSUnitTestsSetup](https://github.com/chiragrupani/TSUnitTestsSetup)获得。 它包含每个框架的设置和示例。

设置非常简单，我们将安装相应的测试框架及其类型。 我们将使用ts-node（用于Mocha），jasmine-ts（用于jasmine）和ts-jest（用于Jest）来添加TypeScript支持。 我们将使用nyc进行代码覆盖。

我们将遵循以下约定：将源JS / TS文件放在src文件夹中并测试tests文件夹中的typescript文件。

基本上，它是为TypeScript，测试框架（例如Jasmine / Mocha / Jest）安装npm包，并指定执行测试用例所需的测试脚本，如进一步说明的那样。 除了选定的单元测试框架包外，还需要安装相应的类型。 为了在Node中执行TS测试，我们需要在package.json中指定用于测试的脚本。 package.json文件位于项目的根目录下，并在执行npm init时生成。

要调试TypeScript测试，需要在launch.json中的配置下添加故事下面“VS Code debug”部分下指定的json，可以通过转到Debug Menu然后在VS Code中添加配置来创建。 下面是每个框架的npm命令，测试脚本和VS代码调试配方：

### Mocha/Chai

#### NPM Install Command
```bash
npm i -D chai mocha nyc ts-node typescript
npm i -D @types/chai @types/mocha
```

#### Test Script
```json
"scripts": {
    "test": "mocha -r ts-node/register tests/**/*.test.ts",
    "testWithCoverage": "nyc -r lcov -e .ts -x \"*.test.ts\" mocha -r  ts-node/register tests/**/*.test.ts && nyc report"
}
```

#### VS Code Debug
```json
{
      "type": "node",
      "request": "launch",
      "name": "Mocha Current File",
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": [
        "--no-timeouts",
        "--colors",
        "${file}",
        "--require",
        "ts-node/register"
      ],
      "console": "integratedTerminal",
      "sourceMaps": true,
      "internalConsoleOptions": "neverOpen"
}
```

#### Sample Test
```javascript
describe('calculate', function() {
  it('add', function() {
    let result = Calculator.Sum(5, 2);
    expect(result).equal(7);
  }); 
});
```


### Jasmine
#### NPM Install Command
```bash
npm i -D jasmine jasmine-ts nyc ts-node typescript
npm i -D @types/jasmine
```
#### Test Script
```json
"scripts": {
  "test": "jasmine-ts --config=jasmine.json",
  "testWithCoverage": "nyc -r lcov -e .ts -x \"*.test.ts\" jasmine-ts --config=jasmine.json && nyc report"
}
```
#### The `jasmine.json` at root directory specifies path for tests like below:
```json
{
   "spec_dir": "tests",
   "spec_files": ["**/*[tT]est.ts"]
}
```
#### VS Code Debug
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jasmine Current File",
  "program": "${workspaceFolder}/node_modules/jasmine-ts/lib/index",
  "args": ["${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```
#### Sample Test
```javascript
describe('calculate', function() {
  it('add', function() {
    let result = Calculator.Sum(5, 2);
    expect(result).toBe(7);
  });
});
```

### Jest

#### NPM Install Command
```bash
npm i -D jest ts-jest typescript
npm i -D @types/jest
```

#### Test Script
```json
"scripts": {
  "test": "jest",
  "testWithCoverage": "jest --coverage"
}
```

#### VS Code Debug
```json
{
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest"
      }
}
```

注意：这里的测试脚本只是“jest””。 要使用TypeScript，我们在package.json所在位置的新config jest.config.js文件中定义transform

```javascript
module.exports = {
  transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
```

关键是testRegex，我们在test文件夹下匹配以test / spec结尾的ts / tsx文件。 它将由ts-jest处理。 我们在'testEnvironment'中使用'node'，因为我们正在Node上执行测试（这使得它更快），否则我们将使用默认的'jsdom'值。

#### Sample Test
```javascript
describe('calculate', function() {
  it('add', function() {
    let result = Calculator.Sum(5, 2);
    expect(result).toBe(7);   
});
```

这是设置所需的全部，可以通过执行命令来运行测试：
```bash
npm t
```
npm t是npm run test和获取覆盖结果的快捷方式：
```bash
npm run testWithCoverage
```


> 添加测试用例

在添加单元测试用例之前，首先让我们了解Suite和Specs。 Spec是每个单独的测试用例，包含一个或多个断言。 测试用例在其期望为真时通过。 通常使用itfunctions定义（基于测试框架）。 它包含两个参数 - 一个是测试用例的名称，另一个是包含断言的函数。 套件是一组相关的规范，通常使用类似于它的描述来定义，并包含许多功能。 上面的示例测试用例显示了如何为每个框架定义它。

在执行一些代码（测试初始化）之前和之后（清理）每个测试用例，模拟外部对象/服务等依赖于框架，框架的文档将包含所需的信息。