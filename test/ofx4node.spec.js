
var ofx4node = require('../lib/ofx4node');
var nock = require('nock');

ofx4node.logOfxRequest = false;
ofx4node.logOfxResponse = false;

describe('ofx4node', function() {

    beforeEach(function(){
        institute = {
            url : 'https://fakebank/ofx',
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

    it('should download statement',function(done){
        nock('https://fakebank')
            .defaultReplyHeaders({'Content-Type': 'application/x-ofx'})
            .filteringRequestBody(function() {})
            .post('/ofx')
            .replyWithFile(200, './test/test.ofx');
        ofx4node.downloadStatement(institute,account,options,function(error,ofx){
            expect(error).toBeNull();
            expect(ofx).toBeDefined();
            expect(ofx.signonmsgsrsv1).toBeDefined();
            done();
        });
    });

    it('should fail with 404',function(done){
        nock('https://fakebank')
            .defaultReplyHeaders({'Content-Type': 'application/x-ofx'})
            .filteringRequestBody(function() {})
            .post('/ofx', '')
            .reply(404);
        ofx4node.downloadStatement(institute,account,options,function(error,ofx){
            expect(error).toBeDefined();
            expect(ofx).toBeFalsy();
            done();
        });
    });

    it('should fail with invalid content type',function(done){
        nock('https://fakebank')
            .defaultReplyHeaders({'Content-Type': 'text/html'})
            .filteringRequestBody(function() {})
            .post('/ofx', '')
            .replyWithFile(200, './test/bad.ofx.html');
        ofx4node.downloadStatement(institute,account,options,function(error,ofx){
            expect(error).toBeDefined();
            expect(ofx).toBeFalsy();
            done();
        });
    });


});