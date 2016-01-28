(function(dust) {

    /* Note: all error conditions are logged with dust.log() and skipped silently.
     * If you want to see them you need to active:
     * dust.isDebug = true;
     * dust.debugLevel = 'WARN';
     * See: https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#debugging-a-dust-template
     */

    var WARN_LEVEL = "WARN";
    var INFO_LEVEL = "INFO";


    /**
    * Range: repeats the block N times. 
    * you can pass custom start/end values by the parameters from and to.  
    */
    dust.helpers.range = function(chunk, context, bodies, params) {
            var body = bodies.block,
                range=require('js-range');
            params = params || {};
            
            function processBody(i) {
                return body(chunk, context.push({
                    $i: i
                }));
            }
            
            if (!params.to && !params.n) {
                dust.log('Missing parameter \'to\' or \'n\' in the range helper.', WARN_LEVEL);
                return chunk;
            }

            var from = Number(context.resolve(params.from)) || 0,
                to = Number(context.resolve(params.to)) || Number(context.resolve(params.n)) + from,
                step = Number(context.resolve(params.step)) || 1,
                items = range(from,to,step);

            return items.reduce(function(acc, x) {
                return processBody(x)
            }, chunk);
    }

    /**
     * copy of copy of https://github.com/rragan/dust-motes/blob/master/src/helpers/control/iterate/iterate.js
     * iterate helper, loops over given object.
     * Inspired: https://github.com/akdubya/dustjs/issues/9
     *
     * Example:
     * {@iterate key=obj}{$key}-{$value} of type {$type} with parent key: {$parentKey}{~n}{/iterate}
     *
     * @param key - object of the iteration - Mandatory parameter
     * @param sort - Optional. If omitted, no sort is done. Values allowed:
     * sort="asc" - sort ascending (per JavaScript array sort rules)
     * sort="desc" - sort descending
     * sort="fname" - Look for fname object in global context,
     * if found, treat it as a JavaScript array sort compare function.
     * if not found, result is undefined (actually sorts ascending
     * but you should not depend on it)
     */
    dust.helpers.iterate = function(chunk, context, bodies, params) {
        var body = bodies.block;
        params = params || {};

        function desc(a, b) {
            return (a < b) ? 1 : ((a > b) ? -1 : 0)
        }

        function processBody(key, value) {
            var parentKey = context.get('$key');
            return body(chunk, context.push({
                $key: key,
                $parentKey: parentKey,
                $value: value,
                $type: typeof value
            }));
        }

        if (!params.key) {
            dust.log('Missing parameter \'key\' in the iter helper.', WARN_LEVEL);
            return chunk;
        }
        if (!body) {
            dust.log('Missing body block in the iter helper.', WARN_LEVEL);
            return chunk;
        }

        var obj = context.resolve(params.key);
        var keys = Object.keys(obj);

        if (!!params.sort) {
            var sort = context.resolve(params.sort);
            var compareFn = context.global[sort];
            if (!compareFn && sort == 'desc') {
                compareFn = desc;
            }
            if (compareFn) {
                keys.sort(compareFn);
            } else {
                keys.sort();
            }
        }

        return keys.reduce(function(acc, x) {
            return processBody(x, obj[x])
        }, chunk);

    };

    /**
    * validates common parameters.
    */
    function validate(helper_name, context, params) {

        if (typeof params.arr == 'undefined') {
            dust.log('{@' + helper_name + '} \'arr\' parameter is missing or incorrect', WARN_LEVEL);
            return false
        }

        // Get the values of all the parameters. The tap function takes care of resolving any variable references
        // used in parameters (e.g. param="{name}")
        if (!dust.isArray(context.resolve(params.arr))) {
            dust.log('{@' + helper_name + '} \'arr\' parameter is not an Array.', WARN_LEVEL);
            return false;
        }

        if (!params.key) {
            dust.log('cannot resolve key:' + params.key + 'found: ' + context.resolve(), WARN_LEVEL)
            dust.log('{@' + helper_name + '} \'key\' parameter is missing.', WARN_LEVEL);
            return false;
        }

        if (!params.value) {
            dust.log('{@' + helper_name + '} \'value\' parameter is missing.', INFO_LEVEL);
        }

        return true
    }


    /**
     * {@some arr=myObj key=myKey value=myValue}{/some}
     *
     * @param arr - the array containing the objects to be iterated
     * @param key - the key in the object
     * @param value - the value of the key to be checked.
     */
    function some(chunk, context, bodies, params) {
        params = params || {};
        if (!validate('some', context, params)) {
            return chunk;
        }
        var arr = context.resolve(params.arr);
        var key = context.resolve(params.key);
        var value = context.resolve(params.value);
        // dust.log('found value:' + value, WARN_LEVEL); 
        var res = arr.filter(function(x) {
            if (!value) {
                return x.hasOwnProperty(key);
            } else {
                return x[key] == value;
            }
        });

        if (res.length > 0) {
            chunk = bodies.block(chunk, context);
        } else {
            dust.log('{@some} No element with key value \'' + key + '\':\'' + value + '\' found.', INFO_LEVEL);
        }
        return chunk
    };
    dust.helpers.some = some;
    /**
     * {@all arr=myObj key=myKey value=myValue}{/all}
     *
     * @param arr - the array containing the objects to be iterated
     * @param key - the key in the object
     * @param value - the value of the key to be checked.
     */
    function all(chunk, context, bodies, params) {
        params = params || {};
        if (!validate('all', context, params)) {
            return chunk;
        }
        var arr = context.resolve(params.arr);
        var key = context.resolve(params.key);
        var value = context.resolve(params.value);
        var res = arr.filter(function(x) {
            if (!value) {
                return x.hasOwnProperty(key);
            } else {
                return x[key] == value;
            }
        });
        if (res.length == arr.length) {
            chunk = bodies.block(chunk, context);
        } else {
            dust.log('{@all} Some elements don\'t possess key value \'' + key + '\':\'' + value + '\' found.', INFO_LEVEL);
        }
        return chunk
    };
    dust.helpers.all = all;

    /**
     * {@contains arr=myObj key=myKey value=myValue}{/contains}
     *
     * @param arr - the array containing the objects to be iterated
     * @param key - the key in the object
     * @param value - the value of the key to be checked.
     * @param scope - 'once' or 'all'.
     * 'once' checks whether there is at least one element in the array has the given key and value.
     * 'all' checks whether all elements in the array have the given key and value.
     */
    dust.helpers.contains = function contains(chunk, context, bodies, params) {
        params = params || {};
        var body = bodies.block;
        var ONCE = 'once';
        var ALL = 'all';

        if (!validate('contains', context, params)) {
            return chunk;
        }

        var scope = context.resolve(params.scope);

        if (typeof scope == 'undefined') {
            scope = ONCE;
        }
        if (typeof scope != 'string' ||
            (scope.toLowerCase() !== ONCE && scope.toLowerCase() !== ALL)) {
            dust.log('{@contains} \'scope\' parameter should be the string \'' + ONCE + '\' or \'' + ALL + '\'', WARN_LEVEL);
            return chunk;
        }

        if (scope === ONCE) {
            return some(chunk, context, bodies, params);
        } else if (scope === ALL) {
            return all(chunk, context, bodies, params)
        }

        return chunk;
    };

    if (typeof exports !== 'undefined') {
        module.exports = dust;
    }

})
(typeof exports !== 'undefined' ? require('dustjs-helpers') : dust);
