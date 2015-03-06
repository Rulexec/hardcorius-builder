var fs = require('fs'),
    path = require('path'),

    M = require('asyncm'),
    nunjucks = require('nunjucks');

module.exports = Builder;

function Builder(options) {
  var self = this;

  var templateDirs = options.templateDirs,
      pageTemplateName = options.pageTemplate;

  var nunjucksEnv, pageTemplate, itemTemplate;

  this.start = M.wrap(function(callback, options) {
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(templateDirs));
    pageTemplate = nunjucksEnv.getTemplate(pageTemplateName, true);

    this.cont(null, self);
  });

  this.render = function(options) {
    var itemsStructure = options.itemsStructure,
        itemsFolder = options.itemsFolder,
        templateVars = options.templateVars;

    var itemsList = [], rootItems = [];
    itemsStructure.forEach(function(x) {
      formList(1, x, function(y) {
        rootItems.push(y);
      });
    });

    return M.parallel(itemsList, {drop: true, f: M.wrap(function(callback, mOptions, x) {
      var file = path.join(itemsFolder, x.id + '.html');
      fs.readFile(file, {encoding: 'utf-8'}, function(error, fileContent) {
        if (error) { callback(error); return; }

        var pos = fileContent.indexOf('\n');

        x.title = fileContent.slice(0, pos),
        x.content = fileContent.slice(pos + 1);

        callback();
      });
    })}).bind(function() {
      var vars = Object.create(templateVars);
      vars.$rootItems = rootItems;

      var rendered = pageTemplate.render(vars);
      
      this.cont(null, rendered);
    });

    function formList(depth, node, f) {
      var o = {
        id: undefined,
        depth: depth,
        children: []
      };

      if (Array.isArray(node)) {
        o.id = node[0];
        itemsList.push(o);
        f(o);
        for (var i = 1; i < node.length; i++) {
          formList(depth + 1, node[i], function(x) {
            o.children.push(x);
          });
        }
      } else {
        o.id = node;
        itemsList.push(o);
        f(o);
      }
    }
  };
}
