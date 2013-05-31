
var schema = require('../lib/schema');

describe('schema', function() {
    it('should validate account with no optional properties', function(){
        var account = {
            accountNumber: '23423423',
            accountType : 'CHECKING',
            userid : 'blah',
            userpass: 'secret'
        };
        schema.validateAccount(account);
    });

});
