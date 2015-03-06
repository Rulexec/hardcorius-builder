var photon = require('ruliov-photon-legacy'),
    path = require('path'),
    send = require('send');

var builderPath = process.env.BUILDER;

var buildM = require(builderPath)(true);

var app = photon(
).use(photon.common()
).use(photon.path()
).use(photon.mime('text/html', 'utf-8')
).extend(photon.routing());

app.get('/', function(req, res) {
  buildM.run(function(error, output) {
    if (error) res.end(error);
    else res.end(output);
  });
});

var staticDir = path.join(__dirname, 'static');
app.use(function(req, res, next) {
  send(req, path.join(staticDir, req.path.slice(1))).pipe(res);
});

var port = process.env.PORT || 7000;
app.listen(port);

console.log('listening at ' + port);
