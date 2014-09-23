dustjs-helpers-extra
====================

Dust.js [official](https://github.com/linkedin/dustjs-helpers) plus extra helpers.

# Extra Helpers


## Contains

```
{@contains arr=myObj key=myKey value=myValue}{/contains}

arr - the array containing the objects to be iterated 

key - the key in the object

value - the value of the key to be checked.
```


## Iterate

Build upon: https://github.com/rragan/dust-motes/tree/master/src/helpers/control/iterate

Additional context variable: ``{$parentKey}`` giving the parent key in a nested iteration.

## Definition 

```
{@iterate for=obj}{$key}-{$value} of type {$type} with parent key: {$parentKey}{~n}{/iter}

key - object of the iteration - Mandatory parameter

sort - Optional. If omitted, no sort is done. Values allowed:
       sort="asc" - sort ascending (per JavaScript array sort rules)
       sort="desc" - sort descending
       sort="fname" - Look for fname object in global context,
       if found, treat it as a JavaScript array sort compare function.
       if not found, result is undefined.
```


# Install

```
npm install dustjs-helpers-extra
```

# Test

Run ``grunt test``.

# History

* 0.1.0 - added new context variable ``{$parentKey}`` and tests.
