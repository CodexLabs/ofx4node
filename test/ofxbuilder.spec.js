
var ofxbuilder = require('../lib/ofxbuilder');
var ofxUtils = require('../lib/ofxutils');
var util = require('util');

describe('OFX Builder: ', function() {

    var institute;
    var account;
    var options;

    beforeEach(function(){
        institute = {
            userid : 'userid',
            userpass : 'userpass',
            org : 'org',
            fid : 'fid'
        };

        account = {
            accountType: 'CHECKING',
            accountNumber: '2343242343',
            routingNumber: '001010'
        };

        options = {
            startAt : '2013-01-01T00:00:00Z'
        }

    });

    it('generates checking request', function(){
        var request = ofxbuilder.buildStatementRequest(institute, account, options);
        expect(request).toBeDefined();
        expect(request).toMatch(/^OFXHEADER:100\r\nDATA:OFXSGML\r\nVERSION:102\r\nSECURITY:NONE\r\nENCODING:USASCII\r\nCHARSET:1252\r\nCOMPRESSION:NONE\r\nOLDFILEUID:NONE\r\nNEWFILEUID:.*/);
        expect(request).toMatch(new RegExp('.+\\<DTCLIENT\\>\\d{8}.*'));
        expect(request).toMatch(new RegExp('.+\\<USERID\\>' + institute.userid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<USERPASS\\>' + institute.userpass + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ORG\\>' + institute.org + '.*'));
        expect(request).toMatch(new RegExp('.+\\<FID\\>' + institute.fid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTID\\>' + account.accountNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<BANKID\\>' + account.routingNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTTYPE\\>' + account.accountType + '.*'));
        expect(request).toMatch(new RegExp('.+\\<DTSTART\\>' + ofxUtils.toOFXDate(options.startAt) + '.*'));
        expect(request).toMatch(new RegExp('.+\\<INCLUDE\\>Y' ));
    });

    it('generates savings request', function(){
        account.accountType = 'SAVINGS';
        var request = ofxbuilder.buildStatementRequest(institute, account, options);
        expect(request).toBeDefined();
        expect(request).toMatch(/^OFXHEADER:100\r\nDATA:OFXSGML\r\nVERSION:102\r\nSECURITY:NONE\r\nENCODING:USASCII\r\nCHARSET:1252\r\nCOMPRESSION:NONE\r\nOLDFILEUID:NONE\r\nNEWFILEUID:.*/);
        expect(request).toMatch(new RegExp('.+\\<USERID\\>' + institute.userid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<USERPASS\\>' + institute.userpass + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ORG\\>' + institute.org + '.*'));
        expect(request).toMatch(new RegExp('.+\\<FID\\>' + institute.fid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTID\\>' + account.accountNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<BANKID\\>' + account.routingNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTTYPE\\>' + account.accountType + '.*'));
        expect(request).toMatch(new RegExp('.+\\<DTSTART\\>' + ofxUtils.toOFXDate(options.startAt) + '.*'));
        expect(request).toMatch(new RegExp('.+\\<INCLUDE\\>Y' ));
    });

    it('generates moneymrkt request', function(){
        account.accountType = 'MONEYMRKT';
        var request = ofxbuilder.buildStatementRequest(institute, account, options);
        expect(request).toBeDefined();
        expect(request).toMatch(/^OFXHEADER.*/);
        expect(request).toMatch(new RegExp('.+\\<USERID\\>' + institute.userid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<USERPASS\\>' + institute.userpass + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ORG\\>' + institute.org + '.*'));
        expect(request).toMatch(new RegExp('.+\\<FID\\>' + institute.fid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTID\\>' + account.accountNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<BANKID\\>' + account.routingNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTTYPE\\>' + account.accountType + '.*'));
        expect(request).toMatch(new RegExp('.+\\<DTSTART\\>' + ofxUtils.toOFXDate(options.startAt) + '.*'));
        expect(request).toMatch(new RegExp('.+\\<INCLUDE\\>Y' ));
    });

    it('generates creditline request', function(){
        account.accountType = 'CREDITLINE';
        var request = ofxbuilder.buildStatementRequest(institute, account, options);
        expect(request).toBeDefined();
        expect(request).toMatch(/^OFXHEADER.*/);
        expect(request).toMatch(new RegExp('.+\\<USERID\\>' + institute.userid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<USERPASS\\>' + institute.userpass + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ORG\\>' + institute.org + '.*'));
        expect(request).toMatch(new RegExp('.+\\<FID\\>' + institute.fid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTID\\>' + account.accountNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<BANKID\\>' + account.routingNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTTYPE\\>' + account.accountType + '.*'));
        expect(request).toMatch(new RegExp('.+\\<DTSTART\\>' + ofxUtils.toOFXDate(options.startAt) + '.*'));
        expect(request).toMatch(new RegExp('.+\\<INCLUDE\\>Y' ));
    });

    it('generates credit card request', function(){
        account.accountType = 'CREDITCARD';
        var request = ofxbuilder.buildStatementRequest(institute, account, options);
        expect(request).toBeDefined();
        expect(request).toMatch(/^OFXHEADER.*/);
       expect(request).toMatch(new RegExp('.+\\<CCSTMTTRNRQ\\>.*'));
        expect(request).toMatch(new RegExp('.+\\<USERID\\>' + institute.userid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<USERPASS\\>' + institute.userpass + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ORG\\>' + institute.org + '.*'));
        expect(request).toMatch(new RegExp('.+\\<FID\\>' + institute.fid + '.*'));
        expect(request).toMatch(new RegExp('.+\\<ACCTID\\>' + account.accountNumber + '.*'));
        expect(request).toMatch(new RegExp('.+\\<DTSTART\\>' + ofxUtils.toOFXDate(options.startAt) + '.*'));
        expect(request).toMatch(new RegExp('.+\\<INCLUDE\\>Y' ));
    });

    it('throws an error if account type is not supported',function(){
        var f = function() {
            account.accountType = 'not supported type';
            ofxbuilder.buildStatementRequest(institute, account, options);
        };
        expect(f).toThrow();
    });
});