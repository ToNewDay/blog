const _ = require('lodash');
function replace(res) {
  if (!res) {
    return '';
  } else {
    let str = res.replace(/\r\n/g, "")                                        //全局匹配换行
      .replace(/(\[[\s\S]*?\])\([\s\S]*?\)/g, '$1')                    //全局匹配连接
      .replace(/\n/g, "")                                          //全局匹配换行
      .replace(/\s/g, "")                                          //全局匹配空字符
      .replace(/[^0-9a-zA-Z\u4e00-\u9fa5.，,。？_“”]+/g, ' ')          //删除非中文，英文，数字的字符
    return str;
  }
}





function convertObjToArr(param) {
  let result = [];
  for (x in param) {
    if (_.isNaN(param[x])) {
      continue;
    }
    result.push(param[x]);
  }
  return result;
}

function getUrlCategorieStr(list, url) {
  let navigation = list;
  if (!_.isArray(navigation)) {
    navigation = convertObjToArr(navigation);
  }
  let urlIndex = _.findIndex(navigation, (info) => { return info.path == url || info.rootPath == url });
  if (urlIndex != -1) {
    let targetInfo = _.get(navigation, urlIndex, { title: '' });
    return targetInfo.title;
  }
  for (var i = 0; i < navigation.length; i++) {
    let info = navigation[i];
    let nextArr = _.merge(info.links, info.sections, info.categories);
    let result = getUrlCategorieStr(nextArr, url);
    if (result == '') {
      continue;
    }
    return (info.title == undefined ? info.compendium : info.title) + '-' + result;
  }
  return '';
}



module.exports = {
  replaceMd: replace,
  getUrlCategorieStr: getUrlCategorieStr
}