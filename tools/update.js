var request = require('request');
var async = require('async');
var config = require('config');
var fs = require('fs');
var debug = require('debug')('update');
var crypto = require('crypto');

function updateCacheManifest(callback) {
    var content;
    var lines = [];
    var files = ['index.html'];
    var hashLine = -1;

    async.series([
        function (callback) {
            debug('reading manifest', config.manifest);
            fs.readFile(config.manifest, function (err, data) {
                if (err) {
                    callback(err);
                    return;
                }

                content = data;
                callback(null);
            });
        }, function (callback) {
            lines = content.toString().split(/\r?\n/);

            lines.forEach(function (line, index) {
                if (line.indexOf('# Hash: ') == 0) {
                    hashLine = index;
                }

                if ((line.indexOf('#') == 0) || (line.indexOf('//') == 0) || (line.length == 0) || line.indexOf(':') >= 0 || line.indexOf('*') >= 0 || line.indexOf("CACHE MANIFEST") >= 0) {
                    return;
                }

                files.push(line);
            });

            if (hashLine < 0) {
                callback("Could not find hash line");
                return;
            }

            callback();
        }, function (callback) {
            var hmac = crypto.createHmac('sha1', 'CACHE MANIFEST');
            hmac.setEncoding('base64');

            async.eachSeries(files, function (file, callback) {
                fs.readFile(file, function (err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    hmac.write(data);
                    callback(null);
                });
            }, function (err) {
                if (err) {
                    callback(err);
                    return;
                }

                hmac.end();

                lines[hashLine] = "# Hash: " + hmac.read();
                callback(null);
            });
        }, function (callback) {
            var output = lines.join('\n');
            fs.writeFile(config.manifest, output, callback);
        }
    ], callback);
}

updateCacheManifest(function (err) {
    if (err) {
        console.log(err);
    }
});
