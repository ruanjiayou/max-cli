const fs = require('fs');

class IO {
  /**
  * 判断文件是否存在
  * @param {string} path - 文件路径
  * @return {boolean} - true 文件存在 false 文件不存在
  */
  static isFileExists(path) {
    return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
  }
  /**
  * 判断目录是否存在
  * @param {string} dir - 目录路径
  * @return {boolean} - true 目录存在 false 目录不存在
  */
  static isDirExists(dir) {
    return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
  }
  /**
    * 同步读取文件文本
    * @param {string} path - 文件绝对路径
    * @return {string} - 字符串
    */
  static readTxt(path) {
    var res = '';
    if (IO.isFileExists(path)) {
      try {
        res = fs.readFileSync(path, 'utf-8');
      }
      catch (e) {
        console.log('read error!');
      }
    }
    return res;
  }
  /**
  * 写入文件
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  static writeTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt);
      return true;
    }
    catch (e) {
      return false;
    }
  }
  /**
  * 追加写入文本
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  static addTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt, { flag: 'a+' });
      return true;
    }
    catch (e) {
      return false;
    }
  }
  /**
    * 删除文件
    * @param {string} path 
    */
  static delFile(path) {
    try {
      if (IO.isFileExists(path)) {
        fs.unlinkSync(path);
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
  * 删除文件夹及所有子文件文件
  * @param {string} path 
  */
  static delFolder(path) {
    if (!IO.isDirExists(path)) {
      return true;
    }
    let files = fs.readdirSync(path);//读取该文件夹
    try {
      files.forEach(function (file) {
        var stats = fs.statSync(path + '/' + file);
        if (stats.isDirectory()) {
          IO.delFolder(path + '/' + file);
        } else {
          fs.unlinkSync(path + '/' + file);
        }
      });
      fs.rmdirSync(path);
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }
  /**
    * 创建文件夹
    * @param {string|array} dir 文件夹
    * @returns {boolean} 是否创建成功
    */
  static mkdirs(dir) {
    if (dir instanceof Array) {
      dir = dir.join('/');
    }
    dir = dir.replace(/[/]+|[\\]+/g, '/');
    try {
      if (!fs.existsSync(dir)) {
        var pathtmp = '';
        dir = dir.split('/');
        dir.forEach(function (dirname) {
          pathtmp += pathtmp === '' ? dirname : '/' + dirname;
          if (false === fs.existsSync(pathtmp)) {
            fs.mkdirSync(pathtmp);
          }
        });
      }
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }
}

module.exports = IO;