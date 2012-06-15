var path = require("path");

var nosef = require("nosef");

var args = {
    path: "./",
    host: "127.0.0.1",
    port: 8000,
    index: "index.html"
};

if(process.argv.length == 3 && /^--?h(elp)?$/.test(process.argv[2])) {
    console.log("Usage: miniserv [PATH] [-h HOST] [-p PORT] [-i INDEX]");
    console.log("  PATH defaults to " + args.path);
    console.log("  HOST defaults to " + args.host);
    console.log("  PORT defaults to " + args.port);
    console.log("  INDEX defaults to " + args.index);

    process.exit();
}

for(var i=2; i<process.argv.length; i++) {
    if(/^--?h(ost)?/.test(process.argv[i])) {
        args.host = process.argv[++i];
    } else if(/^--?p(ort)?/.test(process.argv[i])) {
        args.port = process.argv[++i];
    } else if(/^--?i(ndex)?/.test(process.argv[i])) {
        args.index = process.argv[++i];
    } else {
        args.path = process.argv[i];
    }
}

if(isNaN(args.port)) {
    console.log("Invalid port number: " + args.port);
    process.exit();
}

var config = {
    port: args.port,
    address: args.host,
    middleware: function(request, response) {
        console.log(request.url);
    },
    urls: [ // An array of arrays mapping URL patterns to handler functions
        ["/", nosef.handlers.file(path.join(args.path, args.index))],
        ["/{{path}}", nosef.handlers.file(args.path, "path")]
    ]
};

var server = nosef.server(config);

server.on("start", function() {
    console.log("Serving files from " + args.path + " over " + args.host + ":" + args.port);
});
