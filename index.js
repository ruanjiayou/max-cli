const fs = require('fs');
const path = require('path');
const program = require('commander');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbols = require('log-symbols');
// 默认配置文件
const IO = require('./lib/io');
const configs = require('./config');
const dir = process.cwd();
// 下载git文件的封装
//const getHTML = require('./lib/getHTML');
const url = require('url');

async function handleOne(giturl, dest) {
  let href = url.parse(giturl);
  // 加个master目录
  let paths = href.pathname.replace(/^[/]/, '').replace(/[/]$/, '').split('/');
  paths.splice(2, 0, 'master');
  // 路由映射
  let redirect = url.format({
    protocol: 'https:',
    host: 'raw.githubusercontent.com',
    pathname: paths.join('/'),
    search: href.search,
    hash: href.hash
  });
  const res = await getHTML(redirect);
  if (res.status !== 'success') {
    console.log(symbols.error, `下载 ${giturl} 失败!`);
  } else {
    console.log(symbols.success, `下载 ${giturl} 成功!`);
    IO.writeTxt(dest, res.message);
  }
}

program.on('--help', function () {
  console.log('有问题联系我: 1439120442@qq.com');
});
/**
 * 初始化项目
 */
program
  .command('init <name>', '创建文件夹,初始化一个空的项目')
  .action(async (name) => {
    if (!IO.isDirExists(`${dir}/${name}`)) {
      IO.mkdirs(`${dir}/${name}/.vscode`);
      IO.writeTxt('.vscode/.max.js', JSON.stringify(configs));
      const answers = await inquirer.prompt([
        {
          name: 'description',
          message: '请输入项目描述'
        },
        {
          name: 'author',
          message: '请输入作者名称'
        }
      ]);
      const fileName = `${dir}/${name}/package.json`;
      const meta = {
        name,
        description: answers.description,
        author: answers.author
      }
      if (IO.isFileExists(fileName)) {
        const content = IO.readTxt(fileName);
        const result = handlebars.compile(content)(meta);
        IO.writeTxt(fileName, result);
      }
      console.log(symbols.success, chalk.green('项目初始化完成'));
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });

program
  .command('update <cfg>', '更新指定配置或全部配置')
  .action(async (cfg) => {
    /**
     * 空参数或*: 更新所有config
     * 其他参数: 更新指定config
     * 
     * 项目config文件不存在: 新建
     * 添加config
     * 删除config
     */
    const filepath = dir + '/.vscode/.max.js';
    if (IO.isFileExists(filepath)) {
      let str = IO.readTxt(filepath);
      const temp_config = JSON.parse(str);
      if (cfg === '*' || cfg === 'all') {
        for (let k in temp_config) {
          await handleOne(temp_config[k].origin, path.join(dir, temp_config[k].dest));
        }
      } else if (typeof temp_config[cfg] === 'object') {
        await handleOne(temp_config[cfg].origin, path.join(dir, temp_config[cfg].dest));
      } else {
        console.log(symbols.error, chalk.red('无效的配置项!'));
      }
    }
  });

program
  .command('add <name> <url> <path>', '添加新的配置')
  .action(async (name, url, path) => {
    const filepath = dir + '/.vscode/.max.js';
    if (IO.isFileExists(filepath)) {
      let str = IO.readTxt(filepath);
      const temp_config = JSON.parse(str);
      temp_config[name] = { origin: url, dest: path };
      str = JSON.stringify(temp_config);
      IO.writeTxt(filepath, str);
      await handleOne(url, path.join(dir, path));
      console.log(symbols.success, chalk.green(`添加配置 ${name} 成功!`));
    }
  });

program
  .command('remove <name>', '删除配置')
  .action((name) => {
    const filepath = dir + '/.vscode/.max.js';
    if (IO.isFileExists(filepath)) {
      let str = IO.readTxt();
      const temp_config = JSON.parse(str);
      if (typeof temp_config[name] === 'object') {
        IO.delFile(path.join(dir, temp_config[name].dest));
        delete temp_config[name];
        str = JSON.stringify(temp_config);
        IO.writeTxt(filepath, str);
        console.log(symbols.success, chalk.green(`移除配置 ${name} 成功!`));
      } else {
        console.log(symbols.error, chalk.red(`${name} 配置不存在!`));
      }
    }
  });
console.log(process.argv);
//const argv = Array.prototype.shift.call(process.argv);
// console.log(argv);
// program
//   .command('*')
//   .action(function (env) {
//     console.log('deploying "%s"', env);
//   });

program.parse(process.argv);