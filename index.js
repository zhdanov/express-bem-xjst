'use strict';

var fs = require('fs');
var assert = require('assert');

var walk = require('bem-walk');
var toArray = require('stream-to-array');
// TODO: own fn
var parallelLimit = require('async/parallelLimit');
var bemhtml = require('bem-xjst').bemhtml;

// TODO: BEMTREE
module.exports.bemhtml = function(engineOptions) {

    engineOptions = engineOptions || {};

    var levels = engineOptions.levels || [];
    var bundlesCache = {};
    var blocksCache;

    assert(Array.isArray(levels), 'levels options should be a Array');

    return function(filePath, options, callback) {

        var TECHNAME = options['view engine'] || 'bemhtml.js';

        var bundleName = this.name;
        var bundleCache = bundlesCache[bundleName];

        options.block = options.block || bundleName;

        if (options.cache && bundleCache && blocksCache) {
            render(bundleCache + blocksCache, options, callback);
            return;
        };

        getBundle(filePath, function(error, bundle) {
            if (error) {
                callback(error);
                return;
            }

            bundlesCache[bundleName] = bundle;

            getBlocks(levels, TECHNAME, function(error, blocks) {
                if (error) {
                    callback(error);
                    return;
                }

                blocksCache = blocks;

                render(bundle + blocks, options, callback);

            });

        });

    };

}

function getBundle(filePath, callback) {
    fs.readFile(filePath, function(error, bundle) {

        if (error) {
            callback(error);
            return;
        }

        callback(null,  wrapContent(bundle, filePath));
    });
}

function getBlocks(levels, techName, callback) {
    toArray(walk(levels))
        .then(function(files) {
            return files.filter(function (f) { return f.tech === techName; });
        })
        .then(function(files) {
            return new Promise(function(resolve, reject) {
                parallelLimit(
                    files.map(function(f) { return function (cb) { return fs.readFile(f.path, cb); }}),
                    42,
                    function(error, blocks) {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(blocks.map(function(content, idx) { return wrapContent(content, files[idx]); }).join(''));
                    }
                );
            });
        })
        .then(function(result) { callback(null, result) })
        .catch(callback);
}

function render(templates, data, callback) {
    try {
        var html = bemhtml.compile(templates).apply(data);
        callback(null, html);
    } catch(error) {
        callback(error);
    }
}

function wrapContent(content, marker) {
    return '/* start: ' + marker + '*/\n' + content + '\n/* end ' + marker + ' */\n';
}
