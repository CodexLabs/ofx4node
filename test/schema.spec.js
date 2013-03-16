
var schema = require('../lib/schema');

describe('schema', function() {
    it('should validate account with no optional properties', function(){
        var account = {
            accountNumber: '23423423',
            accountType : 'CHECKING'
        };
        schema.validateAccount(account);
    });

    it('should validate institute with no optional properties', function(){
        var institute = {
            userid : 'blah',
            userpass: 'secret'
        };
        schema.validateInstitute(institute);
    });

    it('should throw error if institute is invalid',function(){
        var f = function(){
            var institute = {};
            schema.validateInstitute(institute);
        };
        expect(f).toThrow();
    });
});
