/* include static file webserver library */
var static = require('node-static');

/* include http server library */
var http = require('http');

/* assume running on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* if not on Heroku readjust port and directory info and we know because port not set */
if(typeof port == 'undefined'  || !port) {
    directory = './public';
    port = 8080;
}
/* set up static web server to deliver files from filesystem */
var file = new static.Server(directory);

/* construct http server that gets files from fileserver */
var app = http.createServer(
    function(request,response) {
        request.addListener('end',
            function(){
                file.serve(request,response);
            }
        ).resume();
    }
).listen(port);

console.log('The server is running');