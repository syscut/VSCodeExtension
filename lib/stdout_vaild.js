/**有新的錯誤訊息再幫忙新增
* @param {String} stdout
* @return {Array} [ isError? , ErrorMsg ]
*/
function stderr (stdout) {
  let result = [false,''];
  if(stdout.includes('No such file or directory')){
    result = [true,'查無此檔或路徑!!'];
    return result;
  }
  if(stdout.includes('Not connected')){
    result = [true,'連線失敗!!'];
    return result;
  }
  if(stdout.includes('Permission denied')){
    result = [true,'權限不足!!'];
    return result;
  }
  if(stdout.includes('Login incorrect')){
    result = [true,'登入失敗!!'];
    return result;
  }

  if(stdout.includes('You have transferred 0 bytes in 0 files')){
    result = [true,'沒有上傳任何檔案'];
    return result;
  }
  return result;
}
module.exports = stderr;