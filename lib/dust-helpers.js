(function (dust) {

  /**
   * copy of copy of https://github.com/rragan/dust-motes/blob/master/src/helpers/control/iterate/iterate.js
   * iterate helper, loops over given object.
   * Inspired: https://github.com/akdubya/dustjs/issues/9
   *
   * Example:
   * {@iterate key=obj}{$key}-{$value} of type {$type} with parent key: {$parentKey}{~n}{/iter}
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
  dust.helpers.iterate = function (chunk, context, bodies, params) {
    var body = bodies.block,
      sort,
      arr,
      i,
      k,
      obj,
      compareFn;
    params = params || {};
    function desc(a, b) {
      if (a < b) {
        return 1;
      } else if (a > b) {
        return -1;
      }
      return 0;
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

    if (params.key) {
      obj = dust.helpers.tap(params.key, chunk, context);
      if (body) {
        if (!!params.sort) {
          sort = dust.helpers.tap(params.sort, chunk, context);
          arr = [];
          for (k in obj) {
            if (obj.hasOwnProperty(k)) {
              arr.push(k);
            }
          }
          compareFn = context.global[sort];
          if (!compareFn && sort === 'desc') {
            compareFn = desc;
          }
          if (compareFn) {
            arr.sort(compareFn);
          } else {
            arr.sort();
          }
          for (i = 0; i < arr.length; i++) {
            chunk = processBody(arr[i], obj[arr[i]]);
          }
        } else {
          for (k in obj) {
            if (obj.hasOwnProperty(k)) {
              chunk = processBody(k, obj[k]);
            }
          }
        }
      } else {
        console.log('Missing body block in the iter helper.');
      }
    } else {
      console.log('Missing parameter \'key\' in the iter helper.');
    }
    return chunk;
  };


  /**
   * {@contains arr=myObj key=myKey value=myValue}{/contains}
   *
   * @param arr - the array containing the objects to be iterated
   * @param key - the key in the object
   * @param value - the value of the key to be checked.
   */
  dust.helpers.contains = function (chunk, context, bodies, params) {
//    params = params || {};
//
//    console.log('params.arr = ' + params.arr);
//
//    if (params.arr) {
//
//      // Get the values of all the parameters. The tap function takes care of resolving any variable references
//      // used in parameters (e.g. param="{name}"
//      var arrObj = dust.helpers.tap(params.arr, chunk, context);
//
//      if (!params.key) {
//        console.log('Missing parameter \'key\' in the contains helper.');
//        return chunk;
//      } else if (!params.value) {
//        console.log('Missing parameter \'value\' in the contains helper.');
//        return chunk;
//      }
//      else {
//
//        var val = false;
//        if (val) {
//          var body = bodies.block;
//          chunk = body(chunk, context);
//          return chunk;
//        } else {
//          return chunk;
//        }
//      }
//
//    } else {
//      console.log('Missing parameter \'arr\' in the contains helper.');
//    }
//    console.log('chunk = ' + chunk);
    return chunk;
  };

  if (typeof exports !== 'undefined') {
    module.exports = dust;
  }

})(typeof exports !== 'undefined' ? require('dustjs-helpers') : dust);