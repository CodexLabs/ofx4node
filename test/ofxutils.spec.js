var ofxutils = require('../lib/ofxutils');

describe('Converts OFX date to ISO date', function(){
    it('should convert ', function(){
        var d = ofxutils.toISODate('20130202');
        expect(d).toBe('2013-02-02T00:00:00.000Z');

        d = ofxutils.toISODate('201301230807');
        expect(d).toBe('2013-01-23T08:07:00.000Z');

        d = ofxutils.toISODate('20130123080758.123');
        expect(d).toBe('2013-01-23T08:07:58.123Z');

        d = ofxutils.toISODate('20071015021529.000[-8:PST]');
        expect(d).toBe('2007-10-15T02:15:29.000-0800');
    });
});

describe('Encrypt and decrypt passwords', function(){

    it('should encrypt and decrypt', function(){
        var pw = 'mypassword';
        var encrypted = ofxutils.encrypt(pw);
        expect(encrypted).not.toBe(pw);
        expect(ofxutils.decrypt(encrypted)).toBe(pw);

    });

    it('should use secret to encrypt and decrypt', function(){
        var pw = 'mypassword';
        var secret = 'super secret';
        var encrypted = ofxutils.encrypt(pw, secret);
        expect(encrypted).not.toBe(pw);
        expect(ofxutils.decrypt(encrypted, secret)).toBe(pw);

    });

});

describe('Converts date to ofx format', function(){
    it('should convert date to short ofx date', function(){
        var date = new Date(ofxutils.toISODate('20130123080758.123'));
        var expectedDate = ofxutils.toShortOfxDate(date);
        expect(expectedDate).toBe('20130123');
    });

    it('should convert string to short ofx date', function(){
        var expectedDate = ofxutils.toShortOfxDate('2013-01-23T08:07:58.123');
        expect(expectedDate).toBe('20130123');
    });

    it('should convert date to long ofx date', function(){
        var date = new Date('2007-10-15T02:15:29.000-0800');
        var expectedDate = ofxutils.toOFXDate(date);
        expect(expectedDate).toBe('20071015101529.000');
    });

    it('should convert string to long ofx date', function(){
        var expectedDate = ofxutils.toOFXDate('2007-10-15T02:15:29.000-0800');
        expect(expectedDate).toBe('20071015101529.000');
    });

    it('should convert midnight gmt to long ofx date', function(){
        var expectedDate = ofxutils.toOFXDate('2007-10-15T00:00:00.000Z');
        expect(expectedDate).toBe('20071015000000.000');
    })

});