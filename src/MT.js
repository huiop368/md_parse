'use strict';

var remark = require('remark');
var jsYaml = require('js-yaml');
var transformer = require('./transformer');

var yaml = {};

yaml.parse = function (text, name) {
  name = name || '__content';
  var re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/
    , results = re.exec(text)
    , conf = {}
    , yamlOrJson;

  if((yamlOrJson = results[2])) {
    if(yamlOrJson.charAt(0) === '{') {
      conf = JSON.parse(yamlOrJson);
    } else {
      conf = jsYaml.load(yamlOrJson);
    }
  }

  conf[name] = results[3] ? results[3] : '';

  return conf;
};

yaml.loadFront = function (context, name) {
  return yaml.parse(context, name)
};

module.exports = function MT(markdown) {
  var ret = {};

  var raw = yaml.loadFront(markdown);
  var ast = remark.parse(raw.__content);
  ret.content = transformer(ast);

  // Get meta data
  delete raw.__content;
  ret.meta = raw;

  return ret;
};
