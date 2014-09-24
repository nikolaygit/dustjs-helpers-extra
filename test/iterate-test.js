require('dustjs-linkedin');
require('dustjs-helpers');

var dust = require('../lib/dust-helpers');
dust.isDebug = true;
dust.debugLevel = 'DEBUG';

var assert = require('assert');

var compareNumbers = function (a, b) {
  var aa = parseInt(a, 10);
  var bb = parseInt(b, 10);
  return aa - bb;
};

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

describe('contains', function() {

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

  it.only('all param is not Boolean', function() {

    var context = {myArr: [{"name": "Steve"}, {"name": "Tom"}]};
    var code = '{@contains arr=myArr key=name scope="invalidScope"}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

  it('once - key param is missing', function() {

    var context = {myArr: []};
    var code = '{@contains arr=myArr key=name}block{/contains}';
    dust.renderSource(code, context, function (err, out) {
      assert.equal(out, '');
    });
  });

});
