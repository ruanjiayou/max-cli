const path = require('path');
const IO = require('./lib/io');
const hinter = require('./lib/hinter');
const program = require('./lib/program');
const configs = require('./config');
const inquirer = require('inquirer');
const chalk = require('chalk');
const symbols = require('log-symbols');

// 参数列表
const args = process.argv.map((it) => { return it; });
// node路径
const NODE_PATH = args.shift();
// 模块全局路径
const MODULE_PATH = args.shift();
// 当前执行目录
const CWD_PATH = process.cwd();
// 配置文件路径
const CONFIG_PATH_INFO = path.parse(`${CWD_PATH}/.vscode/.max.json`);
CONFIG_PATH_INFO.path = `${CWD_PATH}/.vscode/.max.json`;

program
  .on('-h --help', '帮助手册', () => {
    console.log('  有问题联系我: 1439120442@qq.com');
    for (let i = 0; i < program.manual.length; i++) {
      let manual = program.manual[i];
      let str = program.padding(manual.name, program.Length + 2);
      console.log(`${chalk.green(str)}: ${manual.desc}`);
    }
  });

program
  .command('init <name>')
  .description('创建文件夹,初始化一个空的项目')
  .action(async function (name) {
    //console.log(arguments, 'arguments');// {0:'a'} arguments
    //console.log(name, 'name');// a name
    const project_path = `${CWD_PATH}/${name}`;
    if (IO.isDirExists(project_path)) {
      hinter('ProjectExisted', name);
    } else {
      const answers = await inquirer.prompt([
        { name: 'description', message: '请输入项目描述' },
        { name: 'author', message: '请输入作者名称' }
      ]);
      const filepath = `${project_path}/package.json`;
      const meta = {
        name,
        author: answers.author,
        description: answers.description
      };
      IO.mkdirs(project_path);
      const content = IO.readTxt(`${__dirname}/template/default.hbs`);
      IO.writeTxt(filepath, program.compile(content, meta));
      console.log(symbols.success, chalk.green('项目初始化完成!'));
    }
    if (!IO.isFileExists(`${project_path}/.vscode`)) {
      IO.mkdirs(`${project_path}/.vscode`);
      IO.writeTxt(`${project_path}/.vscode/.max.json`, JSON.stringify(configs, null, 2));
      console.log(symbols.success, chalk.green('初始配置已写入!'));
    } else {
      hinter('ConfigExisted', '.vscode/.max.json');
    }
  });

program
  .command('install')
  .description('添加初始化配置')
  .action(function () {
    if (!IO.isFileExists(CONFIG_PATH_INFO.path)) {
      program.initConfig(CONFIG_PATH_INFO, configs);
    } else {
      hinter('ConfigExisted', '.vscode/.max.json');
    }
  });

program
  .command('update <cfg>')
  .description('更新指定配置或全部配置')
  .action(async function (cfg) {
    program.initConfig(CONFIG_PATH_INFO, configs);
    /**
     * 其他参数: 更新指定config
     * 
     * 项目config文件不存在: 新建
     * 添加config
     * 删除config
     */
    let temp_config = JSON.parse(IO.readTxt(CONFIG_PATH_INFO.path));
    if (cfg === 'all') {
      for (let k in temp_config) {
        let temp = temp_config[k];
        await program.down(temp.origin, path.join(CWD_PATH, temp.dest));
      }
    } else if (typeof temp_config[cfg] === 'object') {
      await program.down(temp_config[cfg].origin, path.join(CWD_PATH, temp_config[cfg].dest));
    } else {
      hinter('InvalidConfig', 'cfg');
    }
  });

program
  .command('add <name> <url> <filepath>')
  .description('添加新的配置')
  .action(async function (name, url, filepath) {
    program.initConfig(CONFIG_PATH_INFO, configs);
    let temp_config = JSON.parse(IO.readTxt(CONFIG_PATH_INFO.path));
    temp_config[name] = { origin: url, dest: filepath };
    str = JSON.stringify(temp_config, null, 2);
    IO.writeTxt(CONFIG_PATH_INFO.path, str);
    await program.down(url, path.join(CWD_PATH, filepath));
    console.log(symbols.success, chalk.green(`添加配置 ${name} 成功!`));
  });

program
  .command('remove <name>')
  .description('删除配置')
  .action(function (name) {
    program.initConfig(CONFIG_PATH_INFO, configs);
    let temp_config = JSON.parse(IO.readTxt(CONFIG_PATH_INFO.path));
    let filepath = path.join(CWD_PATH, temp_config[name].dest);
    delete temp_config[name];
    IO.delFile(filepath);
    IO.writeTxt(CONFIG_PATH_INFO.path, JSON.stringify(temp_config, null, 2));
    console.log(symbols.success, chalk.green(`移除配置 ${name} 成功!`));
  });

program
  .command('list')
  .description('列出所有配置')
  .action(function () {
    console.log('');
    console.log(chalk.red('配置列表'));
    program.initConfig(CONFIG_PATH_INFO, configs);
    let temp_config = JSON.parse(IO.readTxt(CONFIG_PATH_INFO.path));
    let i = 0;
    for (let k in temp_config) {
      i++;
      console.log(chalk.green(` ${i}. ${k}:`));
      console.log('    公网地址:' + temp_config[k].origin);
      console.log('    本地路径:' + path.join(CWD_PATH, temp_config[k].dest));
    }
  });

program.parse(args);