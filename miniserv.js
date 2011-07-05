var http = require("http");
var fs = require("fs");

var path = "./";
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
            path = process.argv[2];
        }
    } else {
        // It's a number, probably a port
        port = process.argv[2];
    }
} else if(process.argv.length == 4) {
    path = process.argv[2];
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

// A few basic extensions in case we don't have a mime.types
var extensions = {
    html: "text/html",
    txt: "text/plain",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    css: "text/css",
    js: "text/javascript"
};

// Work out where we're running from
var myDir = process.argv[1].replace(/[^\/]+$/, "");
try {
    var data = fs.readFileSync(myDir + "mime.types");
    if(data) {
        console.log("Importing mime types");
        data.toString("utf8").split(/\n/).forEach(function(m) {
            var match = /^([^\s]+)\s+(.*)$/.exec(m);

            if(match) {
                match[2].split(/\s+/).forEach(function(e) {
                    extensions[e] = match[1];
                });
            }
        });
    }
} catch(e) {
    // Actually, we don't care
}

console.log("Serving files from " + path + " over " + ip + ":" + port);

var server = http.createServer(function(request, response) {
    var file = request.url.replace(/^[\/\.]+/, path).replace(/\.\.\//g, "");
    var extension = file.replace(/^.+\.([^\.]+)$/, "$1").toLowerCase();

    if(file == path) {
        file = path + "/index.html";
    }

    console.log(file);

    fs.readFile(file, function(err, data) {
        if(err) {
            response.writeHead(404);
            response.end();
        } else {
            var headers = {};
            if(extensions[extension]) {
                headers["Content-Type"] = extensions[extension];
            }
            headers["Content-Length"] = data.length;

            response.writeHead(200, headers);
            response.end(data);
        }
    });
});

try {
    server.listen(port, ip);
} catch(e) {
    console.log("Couldn't start miniserv: " + e.message);
}
