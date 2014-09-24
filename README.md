dustjs-helpers-extra
====================

Dust.js [official](https://github.com/linkedin/dustjs-helpers) plus extra helpers.

# Extra Helpers


## Contains

The Dust.js contains helper checks whether in a given array keys and values exist.

```
{@contains arr=myObj key=myKey value=myValue all=true}{/contains}

arr - the array containing the objects to be iterated 

key - the key in the object

value - the value of the key to be checked.

scope - 'once' or 'all'.
    'once' checks whether there is at least one element in the array has the given key and value.
    'all' checks whether all elements in the array have the given key and value.
```

### Examples

For the context:

```
{
  myArr: [
    {"name": "Steve"},
    {"name": "Steve"}
  ]
}
```

template #1:

```
{@contains arr=myArr key="name" value="Steve" scope="all"}
block
{/contains}
```

renders to:

```
block
```

and template #2:

```
{@contains arr=myArr key="name" value="John" scope="all"}
block
{/contains}
```

renders to empty string.


## Iterate

Build upon: https://github.com/rragan/dust-motes/tree/master/src/helpers/control/iterate

Additional context variable: ``{$parentKey}`` giving the parent key in a nested iteration.

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

* 0.2.0 - new ``{@contains}`` helper and tests.
* 0.1.0 - iterate: new context variable ``{$parentKey}`` and tests.
