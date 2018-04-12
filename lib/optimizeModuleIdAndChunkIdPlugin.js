/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author codeages
*/
function OptimizeModuleIdAndChunkIdPlugin() {
}
module.exports = OptimizeModuleIdAndChunkIdPlugin;

OptimizeModuleIdAndChunkIdPlugin.prototype.apply = function(compiler) {
    var hashFunction = compiler.options.output.hashFunction;
    var hashDigest = compiler.options.output.hashDigest;
    var hashDigestLength = compiler.options.output.hashDigestLength;
    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("before-module-ids", function(modules) {
            var moduleResourseArr = [];
            modules.forEach(function(module) {
                if(module.id === null && module.resource) {
                    var hash = require("crypto").createHash(hashFunction);

                    var nodeModulesPathIndex = module.resource.indexOf('node_modules');
                    //hash is based on module's relative pathname, which is alway unique and fixed between different bundles

                    if (nodeModulesPathIndex > 0) {
                        hash.update(module.resource.substr(nodeModulesPathIndex));
                    } else {
                        hash.update(module.resource.replace(compiler.context, ''));
                    }

                    // 新增对组件样式(以style节点插入html的形式)的支持
                    if (moduleResourseArr.indexOf(module.resource) && !module.fileDependencies.length) {
                        module.id = hash.digest(hashDigest).substr(0, hashDigestLength - 1 ) + 1;
                    } else {
                        module.id = hash.digest(hashDigest).substr(0, hashDigestLength);
                        moduleResourseArr.push(module.resource)
                    }
                }
            });
        });
        compilation.plugin("before-chunk-ids", function(chunks) {
            chunks.forEach(function(chunk) {
                if(chunk.id === null) {
                    chunk.id = chunk.name;
                }
                if(!chunk.ids) {
                    chunk.ids = [chunk.id];
                }
            });
        });
    });
};
