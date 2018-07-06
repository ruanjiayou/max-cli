# max-cli
```
定制自己的脚手架,提高工作效率(windows里用git-bash不要用cmd!)
npm install max-cli -g
```
### 使用说明
```
命令行里的*有毒
帮助手册
  max-cli -h 或者 max-cli --help
初始化一个项目:
  max-cli init project_name 
安装配置:
  max-cli install
(进入项目目录)添加配置:
  max-cli add shttp https://github.com/ruanjiayou/net/index.js src/libs/shttp.js
更新配置:
  max-cli update shttp
移除配置:
  max-cli remove shttp
列出所有配置:
  max-cli list
```
### 引用库说明
```
Inquirer.js: 通用的命令行用户界面集合: 用于和用户进行交互。
chalk: 可以给终端的字体加上颜色。
log-symbols: 可以在终端上显示出 √ 或 × 等的图标。
```
2018-6-29 00:56:45
```
  不用TJ的commander 自己处理process.argv伪数组
  command('cmd <name>').description('description').action(function)
```
2018-7-6 10:31:07
```
  下载文件有时会是socket hang up
  -g安装有问题
```