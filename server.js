var connect = require('/usr/local/lib/node_modules/connect');
var serveStatic = require('/usr/local/lib/node_modules/serve-static');
connect().use(serveStatic(__dirname)).listen(8080, function(){
    console.log('Server running on 8080...');
});
