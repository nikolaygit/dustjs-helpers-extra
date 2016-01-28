require('dustjs-linkedin');
require('dustjs-helpers');

var dust = require('../lib/dust-helpers');
dust.isDebug = true;
dust.debugLevel = 'WARN';

var assert = require('assert');

var compareNumbers = function (a, b) {
  var aa = parseInt(a, 10);
  var bb = parseInt(b, 10);
  return aa - bb;
};




describe('range', function () {

  it('simply repeats items', function () {
    var code = '{@range n=3}a{/range}';
    dust.renderSource(code, {}, function (err, out) {
      assert.equal(out, 'aaa');
    });
  });

  it('repeats and pass the iteration number', function () {
    var code = '{@range n=3}a{$i}{/range}';
    dust.renderSource(code, {}, function (err, out) {
      assert.equal(out, 'a0a1a2');
    });
  });

  it('repeats complex blocks ', function () {
    var code = '<ul>{@range n=3}<li>a{$i}</li>{/range}</ul>';
    dust.renderSource(code, {}, function (err, out) {
      assert.equal(out, '<ul><li>a0</li><li>a1</li><li>a2</li></ul>');
    });
  });

  it('repeats n starting from x', function () {
    var code = '{@range from=3 n=5 }a{$i}{/range}';
    dust.renderSource(code, {}, function (err, out) {
      assert.equal(out, 'a3a4a5a6a7');
    });
  });


  it('repeats with steps and from', function () {
    var code = '{@range from=2 to=10 step=2}a{$i}{/range}';
    dust.renderSource(code, {}, function (err, out) {
      assert.equal(out, 'a2a4a6a8');
    });
  });




});


describe('iterate', function () {

  it('simple object iteration', function () {
    var context = { obj: {a: "A", b: "B", c: "C" } };
    var code = '{@iterate key=obj}{$key}:{$value} {$type} {/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'a:A string b:B string c:C string ');
    });
  });

  it('iterate ascending sort', function () {
    var context = { obj: {c: "C", a: "A", b: "B" } };
    var code = '{@iterate key=obj sort="asc"}{$key}:{$value} {/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'a:A b:B c:C ');
    });
  });

  it('iterate descending sort', function () {
    var context = { obj: {c: "C", a: "A", b: "B" } };
    var code = '{@iterate key=obj sort="desc"}{$key}:{$value} {/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'c:C b:B a:A ');
    });
  });

//  it('iterate no key param', function () {
//    var context = { };
//    var code = '{@iterate foo=1}{$key}{/iterate}';
//    dust.renderSource(code, context, function (err, out) {
//      assert.equal(out, '');
//    });
//  });

  it('iterate helper pass array obj for key', function () {
    var context = {arr: [1, 2, 3]};
    var code = '{@iterate key=arr}{$key}:{$value} {/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '0:1 1:2 2:3 ');
    });
  });

  it('iterate helper pass string obj for key', function () {
    var context = {name: "dust"};
    var code = '{@iterate key=name}{$key}:{$value} {/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '0:d 1:u 2:s 3:t ');
    });
  });

  it('iterate with user-supplied compare function for numeric sort', function () {
    var context = { obj: {10: "C", 1: "A", 300: "B" } };
    var base = dust.makeBase({"compareNumbers": compareNumbers});
    var code = '{@iterate key=obj sort="compareNumbers"}{$key}:{$value} {/iterate}';
    dust.renderSource(code, base.push(context), function (err, out) {
      assert.equal(out, '1:A 10:C 300:B ');
    });
  });

  it('nested iteration - different keys and values and parent key', function () {
    var context = {
      "first": {
        "11": "AA",
        "nested": {
          "22": "BB",
          "33": "CC"
        }
      },
      "second": {
        "44": "DD",
        "nested": {
          "55": "EE",
          "66": "FF"
        }
      }
    };
    var code =
      '{@iterate key=.}' +
      '|{$key}' +
      '{#$value}{@iterate key=nested}||(parent={$parentKey}){$key}:{$value}{/iterate}{/$value}' +
      '{/iterate}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(
        out,
        '|first||(parent=first)22:BB||(parent=first)33:CC|second||(parent=second)55:EE||(parent=second)66:FF');
    });
  });

});



describe('{@some}', function() {

  it('no params', function() {
    var context = {myArr: [{"name": "AA"}, {"name": "BB"}]};
    var code = '{@some}block{/some}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });
  this.timeout(15000);
});



describe('{@contains}', function() {

  it('no params', function() {

    var context = {myArr: [{"name": "AA"}, {"name": "BB"}]};
    var code = '{@contains}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });
  this.timeout(15000);

  it('arr param does not exist', function() {

    var context = {myArr: [{"name": "AA"}, {"name": "BB"}]};
    var code = '{@contains arr=noArr}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('arr param is not array', function() {

    var context = {myArr: "stringValue"};
    var code = '{@contains arr=myArr}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('scope param is empty', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" scope=""}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('scope param is invalid string', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" scope="invalidScope"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('once - key not found', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="invalidKey"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('once - key found, render body', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'block');
    });
  });

  it('once - key found, render body with context vars', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}], myVar: "myValue"};
    var code = '{@contains arr=myArr key="name"}{myVar}{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'myValue');
    });
  });

  it('once - value not found', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" value="John"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('once - value found, render body', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" value="Steve"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'block');
    });
  });

  it('once - value found, render body with context vars', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}], myVar: "myValue"};
    var code = '{@contains arr=myArr key="name" value="Steve"}{myVar}{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'myValue');
    });
  });

  it('all - key not found', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="invalidKey" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('all - key found, render body', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'block');
    });
  });

  it('all - value not found - in no array element', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" value="John" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('all - value not found - only in one array element (first)', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key="name" value="Steve" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('all - value not found - only in one array element (middle)', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}, {"name": "Peter"}]};
    var code = '{@contains arr=myArr key="name" value="Tom" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('all - value not found - only in one array element (last)', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}, {"name": "Peter"}]};
    var code = '{@contains arr=myArr key="name" value="Peter" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('all - value found, render body', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Steve"}]};
    var code = '{@contains arr=myArr key="name" value="Steve" scope="all"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, 'block');
    });
  });

});
