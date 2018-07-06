const chalk = require('chalk');

const json = {
  'Unknown': '出现预期外的错误!',
  'NoArguments': '{{value}} 请输入命令行参数!',
  'CommandNotFound': '{{value}} 不支持的命令!',
  'NoFunction': '{{value}} 没有定义响应函数!',
  'ProjectExisted': '{{value}} 项目已存在!',
  'ConfigExisted': '配置 {{value}} 已存在!',
  'DownError': '下载 {{value}} 失败!',
  'InvalidConfig': '{{value}} 无效的配置项!',
  'TemplateNotFound': '模板 {{value}} 不存在'
};

function hinter(type, value) {
  if (json[type] === undefined) {
    type = 'Unknown';
  }
  value = value ? value : '';
  let message = chalk.red(json[type]).replace('{{value}}', value);
  console.log('× ' + message);
}
module.exports = hinter;