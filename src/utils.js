'use strict';

//转化为驼峰
function toCamelCase(property) {
  return property.replace(
    /\-([a-z])/gi,
    (letter) => letter.replace('-', '').toUpperCase()
  );
}
exports.toCamelCase = toCamelCase;

//将style字符串转化为style对象
exports.toStyleObject = function toStyleObject(styleStr) {
  const style = {};
  styleStr.split(/;\s*/g).forEach((rule) => {
    const kv = rule.split(/:\s*/g);
    style[toCamelCase(kv[0])] = kv[1];
  });
  return style;
};
//属性拷贝
exports.assign = function assign(target, source) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
};
//对converters进行筛选
exports.cond = function cond(data, conds, index) {
  const pair = conds.filter((converter) => {
    return converter[0](data);
    //如果返回true，那么表示这个converter应该是可以处理的，满足被处理的条件
  })[0];
  return pair[1](data, index);
};

//独立的标签
exports.isStandalone = function isStandalone(tagName) {
  return tagName === 'hr' || tagName === 'br' || tagName === 'img';
};
