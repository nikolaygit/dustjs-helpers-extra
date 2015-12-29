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
            } 
            else {
                keys.sort();
            }
        } 
        
        return keys.reduce(function(acc, x){return processBody(x, obj[x])}, chunk);
        
    };


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
    dust.helpers.contains = function(chunk, context, bodies, params) {
        params = params || {};
        var body = bodies.block;
        var ONCE = 'once';
        var ALL = 'all';

        if (typeof params.arr !== 'undefined') {

            // Get the values of all the parameters. The tap function takes care of resolving any variable references
            // used in parameters (e.g. param="{name}"
            var arr = context.resolve(params.arr);
            if (dust.isArray(arr)) {

                // set all, default is false
                var scope = context.resolve(params.scope);
                if (typeof scope === 'undefined') {
                    scope = ONCE;
                }

                if (typeof scope === 'string' &&
                    (scope.toLowerCase() === ONCE || scope.toLowerCase() === ALL)) {


                    if (params.key) {
                        var key = context.resolve(params.key);
                        var value = null;
                        if (params.value) {
                            value = context.resolve(params.value);
                        }

                        // search for the key in the array
                        var isKeyFound = false;
                        var isValueFound = false;
                        var len = arr.length;


                        // iterate and search for the key and value in the array
                        if (scope === ONCE) {

                            isKeyFound = false;
                            isValueFound = false;

                            for (var index = 0; index < len; index++) {

                                // stop the iteration if value found
                                if (isKeyFound && (value === null || isValueFound)) {
                                    break;
                                }

                                // iterate through the keys
                                var arrElement = arr[index];
                                for (var elementKey in arrElement) {
                                    if (arrElement.hasOwnProperty(elementKey) && elementKey === key) {
                                        isKeyFound = true;

                                        // search and set value
                                        if (value) {
                                            if (arrElement[elementKey] === value) {
                                                isValueFound = true;
                                                break;
                                            }
                                        } else {
                                            break;
                                        }
                                    }
                                }
                            }
                        } else if (scope === ALL) {

                            isKeyFound = true;
                            isValueFound = true;

                            for (var i = 0; i < len; i++) {

                                // stop the iteration if key or value not found
                                if (!isKeyFound || !isValueFound) {
                                    break;
                                }

                                // iterate through the keys
                                var arrObj = arr[i];
                                for (var arrObjProp in arrObj) {
                                    if (arrObj.hasOwnProperty(arrObjProp)) {
                                        if (arrObjProp === key) {
                                            // search and set value
                                            if (value) {
                                                if (arrObj[arrObjProp] !== value) {
                                                    isValueFound = false;
                                                    break;
                                                }
                                            } else {
                                                // key found, value not needed, go to next array object
                                                break;
                                            }
                                        } else {
                                            isKeyFound = false;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        // display warnings or render the body
                        if (isKeyFound) {
                            if (value === null || isValueFound) {
                                // render the body
                                chunk = body(chunk, context);
                            } else {
                                if (scope === ONCE) {
                                    dust.log('{@contains} No element with key value \'' + key + '\':\'' + value + '\' found.', INFO_LEVEL);
                                } else if (scope === ALL) {
                                    dust.log('{@contains} An element without key value \'' + key + '\':\'' + value + '\' exists.', INFO_LEVEL);
                                }
                            }
                        } else {
                            if (scope === ONCE) {
                                dust.log('{@contains} No element with the key \'' + key + '\' found.', INFO_LEVEL);
                            } else if (scope === ALL) {
                                dust.log('{@contains} An element without key value \'' + key + '\':\'' + value + '\' exists.', INFO_LEVEL);
                            }
                        }

                    } else {
                        dust.log('{@contains} \'key\' parameter is missing.', WARN_LEVEL);
                    }
                } else {
                    dust.log(
                        '{@contains} \'scope\' parameter should be the string \'' + ONCE + '\' or \'' + ALL + '\'',
                        WARN_LEVEL);
                }
            } else {
                dust.log('{@contains} \'arr\' parameter is not an Array.', WARN_LEVEL);
            }
        } else {
            dust.log('{@contains} \'arr\' parameter is missing or incorrect', WARN_LEVEL);
        }
        return chunk;
    };

    if (typeof exports !== 'undefined') {
        module.exports = dust;
    }

})
(typeof exports !== 'undefined' ? require('dustjs-helpers') : dust);
