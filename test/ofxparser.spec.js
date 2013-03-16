
var ofxparser = require('../lib/ofxparser');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');

describe('ofxparser', function(){
    it('should parse', function(done){
        var p = ofxparser.createParser();
        p.on('STMTRS', function(object){
            expect(object).toBeDefined();
            expect(object.CURDEF).toBeDefined();
            expect(object.CURDEF).toBe('USD');
            expect(object.BANKTRANLIST.STMTTRN.length).toBe(3)
        });
        p.on('OFX', function(object){
            expect(object.SIGNONMSGSRSV1).toBeDefined();
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
    });

    it('should parse a string',function(done){
        var str = '<OFX></OFX>';
        var p = ofxparser.createParser();
        p.on('OFX', function(ofx){
            expect(ofx).toBeDefined();
            done();
        });
        p.write(str);
        p.end();
    });

    it('should parse to lower case', function(done){
        var p = ofxparser.createParser({lowercasetags:true});
        p.on('ofx', function(){
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
    });

    it('should have custom name',function(done){
        var p = ofxparser.createParser({
            lowercasetags:true
        });
        p.on('stmttrn', function (value, parentObject) {
            if(_.isUndefined(parentObject.transactions)) {
                parentObject.transactions = [];
            }
            parentObject.transactions.push(value);
            parentObject.stmttrn = undefined;
        });
        p.on('stmtrs', function(object){
            expect(object).toBeDefined();
            expect(object.banktranlist.transactions).toBeDefined();
            expect(object.banktranlist.transactions.length).toBe(3);
        });
        p.on('ofx', function(){
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
    });

    it('should have custom name and value',function(done){
        var parserOptions = {
            lowercasetags:true
        };
        var p = ofxparser.createParser(parserOptions);
        p.on('curdef', function(value, parentObject) {
            parentObject.curdef = 'something crazy';
        });
        p.on('stmtrs', function(object){
            expect(object).toBeDefined();
            expect(object.curdef).toBe('something crazy');
        });
        p.on('ofx', function(){
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
    });

    it('should support building a custom object without using default builder',function(done){
        var removeDeepNesting = function(value, parentObject) {
            parentObject['transactions'] = value.transactions;
        };
        var p = ofxparser.createParser({
            lowercasetags:true
        });
        p.on('banktranlist', removeDeepNesting);
        p.on('stmtrs', removeDeepNesting);
        p.on('stmttrnrs', removeDeepNesting);
        p.on('bankmsgsrsv1', removeDeepNesting);
        p.on('stmttrn', function(value, parentObject) {
            var n = 'transactions';
            if(_.isUndefined(parentObject[n])) {
                parentObject[n] = [];
            }
            parentObject[n].push(value);
        });
        p.on('ofx', function(ofx){
            expect(ofx.transactions).toBeDefined();
            expect(util.isArray(ofx.transactions)).toBeTruthy();
        });
        p.on('ofx', function(){
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
    });

    it('should pass OFX to the next stream in a pipe',function(done){
        var p = ofxparser.createParser();

        var inStr = '';
        var outStr = '';
        var readStream = fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).on('data',function(data){inStr += data.toString()});
        readStream.pipe(p).on('data', function(data){outStr += data.toString()}).on('end', function(){
            expect(inStr.length).toBeGreaterThan(0);
            expect(inStr).toBe(outStr);
            done();
        });
    });

    it('should fail if sax fails', function(done){
        var p = ofxparser.createParser();
        p.on('error', function(error){
            expect(error).toBeDefined();
            console.log(util.inspect(error));
        });
        p.on('end', function(){done()});
        p.write("<sfsdf <test/> />");
        p.end('');

    });

    it('should handle non-OFX documents gracefully', function(done){
        var p = ofxparser.createParser();
        p.on('error', function(object){
            console.log('Got an error: ' + util.inspect(object))
        });
        p.on('end', function(){
            done();
        });
        fs.createReadStream('./test/bad.ofx.html', { encoding: "utf8" }).pipe(p);

    });
});