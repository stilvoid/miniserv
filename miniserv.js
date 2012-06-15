var path = require("path");

var nosef = require("nosef");

var dir = "./";
var ip = "127.0.0.1";
var port = 8000;

var host;

if(process.argv.length == 3 && /^-?-h(elp)?$/.test(process.argv[2])) {
    console.log("Usage: miniserv [PATH] [[HOST:]PORT]");
    console.log("  path defaults to ./");
    console.log("  host defaults to 127.0.0.1");
    console.log("  port defaults to 8000");

    process.exit();
}

if(process.argv.length == 3) {
    if(isNaN(process.argv[2])) {
        // See if it's a host:port
        if(/^[\w\.]+(:\d+)?$/.test(process.argv[2])) {
            host = process.argv[2];
        } else {
            dir = process.argv[2];
        }
    } else {
        // It's a number, probably a port
        port = process.argv[2];
    }
} else if(process.argv.length == 4) {
    dir = process.argv[2];
    host = process.argv[3];
}

if(host) {
    host = host.split(":");
    if(host.length == 1) {
        port = host[0];
    } else if(host.length == 2) {
        ip = host[0];
        port = host[1];
    } else {
        console.log("Could not parse host:port \"" + host.join(":") + "\"");
        process.exit();
    }
}

if(isNaN(port)) {
    console.log("Invalid port number: " + port);
    process.exit();
}

var config = {
    port: port,
    address: host,
    middleware: function(request, response) {
        console.log(request.url);
    },
    urls: [ // An array of arrays mapping URL patterns to handler functions
        ["/", nosef.handlers.file(path.join(dir, "index.html"))],
        ["/{{path}}", nosef.handlers.file(dir, "path")]
    ]
};

var server = nosef.server(config);

server.on("start", function() {
    console.log("Serving files from " + dir + " over " + ip + ":" + port);
});
