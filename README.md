# max-cli
定制自己的脚手架,提高工作效率(windows里用git-bash不要用cmd!)
```

```
- 下载指定文件/GitHub仓库 URL/filename/dir
- 生成cache/刷新 可选选项
```
commander.js: 可以自动的解析命令和参数: 用于处理用户输入的命令。
download-git-repo: 下载并提取 git 仓库: 用于下载项目模板。
Inquirer.js: 通用的命令行用户界面集合: 用于和用户进行交互。
handlebars.js: 模板引擎: 将用户提交的信息动态填充到文件中。
ora: 下载过程久的话: 可以用于显示下载中的动画效果。
chalk: 可以给终端的字体加上颜色。
log-symbols: 可以在终端上显示出 √ 或 × 等的图标。
```
- TODO:package.json没有生成

2018-6-28 00:50:40
- 直接下载git文件

2018-6-29 00:06:29

2018-6-29 00:56:45
```
  不用TJ的commander 自己处理process.argv伪数组
  command('cmd <name>', 'description').action(function)
```
