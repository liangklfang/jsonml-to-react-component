### 1.jsonml-to-react-component
首先判断是否满足converters中第一个判断条件，如果满足条件我们才会通过第二个函数进行jsonml处理
```js
'use strict';

const React = require('react');
const JsonML = require('jsonml.js/lib/utils');
const utils = require('./utils');

let cid = 0;
module.exports = function toReactComponent(jsonml, converters = []) {
  //默认的jsonml的converters
  const defaultConverters = [
    [(node) => JsonML.getTagName(node) === 'style', (node, index) => {
      const tagName = JsonML.getTagName(node);
      const attrs = JsonML.getAttributes(node);
      const styles = JsonML.getChildren(node)[0];
      return React.createElement(tagName, utils.assign({
        key: index,
        //这个key就是每一个react组件必须有的key
        dangerouslySetInnerHTML: {
          __html: styles,
          //创建style标签，同时将style中的css/less内容作为创建的React的style的Element的内容
        },
      }, attrs));
    }],
    [(node) => typeof node === 'string', (node) => node],
    //如果这个node是"string"那么原样返回
    [() => true, (node, index) => {
      const attrs = utils.assign({ key: index }, JsonML.getAttributes(node));
      //其他的node都是做这样的处理
      if (attrs.class) {
        attrs.className = attrs.class;
        delete attrs.class;
      }
      //将class属性转化为className
      if (attrs.style) {
        attrs.style = utils.toStyleObject(attrs.style);
      }
      //将style的string转化为字符串对象，而不是字符串
      const tagName = JsonML.getTagName(node);
      return React.createElement(
        tagName,
        attrs,
        utils.isStandalone(tagName) ?
          undefined :
          //tagName === 'hr' || tagName === 'br' || tagName === 'img'
          JsonML.getChildren(node).map(innerToReactComponent)
          //对每一个子元素都会进行处理的~~
      );
    }],
  ];

  const mergeConverters = converters.concat(defaultConverters);
// exports.cond = function cond(data, conds, index) {
//   const pair = conds.filter((converter) => {
//     return converter[0](data);
//   })[0];
//   return pair[1](data, index);
// };
// The first function is a prediction, and the second function is a 
// processor which take JsonML node and return React Component.
// 首先根据converters[0]也就是第一个函数进行筛选，筛选通过了才会进行jsonml的处理操作
  function innerToReactComponent(jsonml, index) {
    return utils.cond(jsonml, mergeConverters, index);
  }
  return utils.cond(jsonml, mergeConverters, cid++);
};
```

### 2.converters的顺序问题
```js
exports.cond = function cond(data, conds, index) {
  const pair = conds.filter((converter) => {
    return converter[0](data);
    //如果返回true，那么表示这个converter应该是可以处理的，满足被处理的条件
  })[0];
  return pair[1](data, index);
};
```
对converters进行筛选，我们的defaultConverters在最后面，`如果前面有converters
已经满足条件，那么后续的converter不再进行处理`。
