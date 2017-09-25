'use strict';

var Prism = require('prismjs');
require('./autoit')(Prism);
var MT = require('./MT');
var JsonML = require('./jsonml-utils');

var isIntro = function isIntro(element) {
  var type = element[0];
  return type !== 'pre';
};
var isCode = function isCode(element) {
  var type = element[0];
  return type === 'pre' && element[1].lang === 'jsx';
};
var isWalleCode = function isWalleCode(element) {
  var type = element[0];
  return type === 'pre' && element[1].lang === 'walle';
};
var isWalleTpl = function isWalleTpl(element) {
  var type = element[0];
  return type === 'pre' && element[1].lang === 'walletpl';
};
var isWalleJs = function isWalleJs(element) {
  var type = element[0];
  return type === 'pre' && element[1].lang === 'wallejs';
};
var isWalleCss = function isWalleCss(element) {
  var type = element[0];
  return type === 'pre' && element[1].lang === 'wallecss';
};
var isCssCode = function isCssCode(element) {
  return element && JsonML.isElement(element) && JsonML.getTagName(element) === 'pre' && JsonML.getAttributes(element).lang === 'css';
};
var isStyleTag = function isStyleTag(element) {
  return element && JsonML.isElement(element) && JsonML.getTagName(element) === 'style';
};
var isStyle = function isStyle(element) {
  return isCssCode(element) || isStyleTag(element);
};
var getCodeChildren = function getCodeChildren(element) {
  return element && element[2][1];
};

function parseDemo(fileName, content) {
  var fileTree = MT(content);
  var fileContentTree = fileTree.content.slice(1);

  var demo = {};
  var meta = fileTree.meta;
  // var component = fileName.split(path.sep)[1];
  // demo.id = `components-${component}-demo-${path.basename(fileName, '.md')}`;
  demo.meta = meta;

  var intro = fileContentTree.filter(isIntro);
  var currentLocale = '';
  demo.intro = [];
  intro.forEach(function (node) {
    if (node[0] === 'h2') {
      currentLocale = node[1];

      if (Array.isArray(demo.intro)) {
        demo.intro = {};
      }

      demo.intro[node[1]] = [];
      return;
    }
    if (!currentLocale) {
      demo.intro.push(node);
    } else {
      demo.intro[currentLocale].push(node);
    }
  });

  var sourceCode = getCodeChildren(fileContentTree.find(isCode));
  var sourceWalleCode = getCodeChildren(fileContentTree.find(isWalleCode));
  var sourceWalleTplCode = getCodeChildren(fileContentTree.find(isWalleTpl));
  var sourceWalleJsCode = getCodeChildren(fileContentTree.find(isWalleJs));
  var sourceWalleCssCode = getCodeChildren(fileContentTree.find(isWalleCss));

  demo.code = sourceCode;
  demo.walleCode = sourceWalleCode;
  demo.walleTpl = sourceWalleTplCode;
  demo.walleJs = sourceWalleJsCode;
  demo.walleCss = sourceWalleCssCode;

  demo.highlightedCode = Prism.highlight(sourceCode, Prism.languages.autoit);
  demo.highlightedWalleCode = sourceWalleCode && Prism.highlight(sourceWalleCode, Prism.languages.autoit);
  demo.highlightedWalleTplCode = sourceWalleTplCode && Prism.highlight(sourceWalleTplCode, Prism.languages.autoit);
  demo.highlightedWalleJsCode = sourceWalleJsCode && Prism.highlight(sourceWalleJsCode, Prism.languages.autoit);
  demo.highlightedWalleCssCode = sourceWalleCssCode && Prism.highlight(sourceWalleCssCode, Prism.languages.autoit);

  // demo.preview = devil(sourceCode, ['React', 'ReactDOM']);
  var styleNode = fileContentTree.find(isStyle);
  if (isCssCode(styleNode)) {
    demo.style = getCodeChildren(styleNode);
  } else {
    demo.style = JsonML.isElement(styleNode) && JsonML.getChildren(styleNode)[0];
  }
  demo.highlightedStyle = isCssCode(styleNode) ? Prism.highlight(demo.style || '', Prism.languages.autoit) : undefined;

  return demo;
};

module.exports = parseDemo;