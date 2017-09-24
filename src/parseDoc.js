'use strict';
var R = require('ramda');
var Prism = require('prismjs');
require('./autoit')(Prism);
var MT = require('./MT');
var JsonML = require('./jsonml-utils');
var JsonMLs = require('./jsonml-dom');

function getCode(node) {
  return JsonML.getChildren(
    JsonML.getChildren(node)[0] || ''
  )[0] || '';
}

var convertInlineCode = R.map((node) => {
  var tagName = JsonML.getTagName(node);
  var lang = JsonML.getAttributes(node, true).lang;
  
  if (tagName === 'pre' && lang !== undefined) {
    var sourceCode = getCode(node);
    var highlightedCode = Prism.highlight(sourceCode, Prism.languages.autoit);
    var highlightedCodeJsonml = JsonMLs.fromHTMLText(highlightedCode);

    return ['pre', { lang: lang, highlighted: highlightedCode !== sourceCode }, ['code'].concat(highlightedCodeJsonml.slice(1))];
  }
  return node;
});

var isIntro = R.complement(R.either(
  (node) => node[0] === 'hr',
  (node) => node[1] === 'API'
));
var isDescription = R.complement(function(node){ return node[1] === 'API';});
var parseIntro = R.takeWhile(isIntro);
var parseDescription = R.pipe(
  R.dropWhile(isIntro),
  R.takeWhile(isDescription),
  R.when(function(nodes){ return (nodes[0] || [])[0]; }, R.tail)
);
var parseAPI = R.dropWhile(isDescription);

function parseDoc(fileName, content) {
  var fileTree = MT(content);
  var fileContentTree = fileTree.content.slice(1);
  var meta = fileTree.meta;
  meta.fileName = fileName;

  var intro = parseIntro(fileContentTree);
  var description = parseDescription(fileContentTree);

  var enhancedDescription = convertInlineCode(
    description.length > 0 ? description : intro
  );

  var api = parseAPI(fileContentTree);
  var enhancedAPI = convertInlineCode(
    api.length > 0 ? api : []
  );

  return {
    meta,
    intro: description.length === 0 ? null : intro,
    description: enhancedDescription,
    api: enhancedAPI,
  };
};

module.exports = parseDoc;
