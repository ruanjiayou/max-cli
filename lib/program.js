const IO = require('./io');
const url = require('url');
const path = require('path')
const hinter = require('./hinter');
const getHTML = require('./getHTML');
const chalk = require('chalk');

class Handler {
  constructor(name, type = 'command') {
    this.name = name;
    this.type = type;
    this.func = null;
    this.desc = '无';
  }
  action(func) {
    this.func = func;
    return this;
  }
  description(str) {
    this.desc = str;
    program.Length = program.Length > this.name.length ? program.Length : this.name.length;
    program.manual.push({
      type: this.type,
      name: this.name,
      desc: this.desc
    });
    return this;
  }
}

class program {
  // 解析命令行
  static parse(args) {
    if (args.length !== 0) {
      let cmd = args.shift();
      if (cmd.charAt(0) === '-') {
        program.eventHandler(cmd);
      } else {
        program.commandHandler(cmd, args);
      }
    } else {
      hinter('NoArguments');
    }
  }
  // 读取输入
  static async prompt(arr) {
    let res = [], i = 0;
    process.stdin.setEncoding('utf8');
    await new Promise(function (resolve, reject) {
      process.stdin.on('readable', () => {
        if (i >= arr.length) {
          process.stdin.end();
          resolve();
        } else {
          process.stdout.write(arr[i].message);
        }
        const chunk = process.stdin.read();
        if (chunk !== null) {
          res.push(chunk.trim());
        }
        i++;
      });
    });
    let answer = {}
    arr.map((item, index) => {
      answer[item.name] = res[index];
    });
    return answer;
  }
  // 简单模板替换
  static compile(str, data) {
    let reg = /\{\{\s*([a-z0-9]+)\s*\}\}/g, res = str, m = null;
    while ((m = reg.exec(str)) !== null) {
      let [k, v] = m, value = data[v] === undefined ? ' ?? ' : data[v];
      res = res.replace(k, value);
    }
    return res;
  }
  // 配置初始化
  static initConfig(info, configs) {
    if (!IO.isFileExists(info.path)) {
      IO.mkdirs(info.dir);
      IO.writeTxt(info.path, JSON.stringify(configs, null, 2));
    }
  }
  static str_times(str, n) {
    return Array.prototype.join.call({ length: n + 1 }, str);
  }
  // leftpadding
  static padding(str, length) {
    let len = length - str.length;
    return program.str_times(' ', len) + str;
  }
  // on事件处理
  static eventHandler(event) {
    if (program.events[event] === undefined) {
      hinter('EventNotFound', event);
    } else {
      let func = program.events[event].func;
      if (func !== null) {
        func();
      } else {
        hinter('NoFunction', event);
      }
    }
  }
  // cmd命令处理
  static commandHandler(command, args) {
    if (program.commands[command] === undefined) {
      hinter('CommandNotFound', command);
    } else {
      let func = program.commands[command].func;
      if (func !== null) {
        func.apply(this, args);
      } else {
        hinter('NoFunction', command);
      }
    }
  }

  /**
   * 添加on事件
   * @param {string} evt 单个事件或用空格连接的多个事件
   * @param {function} func 响应函数
   */
  static on(evt, desc, func) {
    evt.split(' ').forEach(event => {
      const handler = new Handler(event, 'event').description(desc).action(func);
      program.events[event] = handler;
    });
  }

  /**
   * 添加cmd命令
   * @param {string} name 命令名称,空格及后面的<name>只是好看的
   */
  static command(name) {
    name = name.trim().split(' ')[0];
    const handler = new Handler(name, 'command');
    program.commands[name] = handler;
    return handler;
  }

  static async down(giturl, dest) {
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
    if (res.status !== 'success' || res.message === 'socket hang up') {
      hinter('DownError', giturl);
    } else {
      const info = path.parse(dest);
      IO.mkdirs(info.dir);
      IO.writeTxt(dest, res.message);
      console.log(chalk.green(`√ 下载 ${giturl} 成功!`));
    }
  }
}

program.events = {};
program.manual = [];
program.Length = 0;
program.commands = {};

module.exports = program;