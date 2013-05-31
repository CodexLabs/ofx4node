/*******************************************************************************
 * Copyright (c) 2013. Kurt Rush
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/

var handlebars = require('handlebars');
var ofxutils = require('./ofxutils');
var schema = require('./schema');
var _ = require('underscore');
var util = require('util');

var ofxDefaults = {
    ofxHeader : '100',
    data : 'OFXSGML',
    version : '102',
    security : 'NONE',
    encoding : 'USASCII',
    charset : '1252',
    compression : 'NONE',
    oldFileUID : 'NONE',
    newFileUID : 'NONE',
    clientDate : new Date()
};

var ofxHeader = "OFXHEADER:{{ofxHeader}}\r\nDATA:{{data}}\r\nVERSION:{{version}}\r\nSECURITY:{{security}}\r\nENCODING:{{encoding}}\r\nCHARSET:{{charset}}\r\nCOMPRESSION:{{compression}}\r\nOLDFILEUID:{{oldFileUID}}\r\nNEWFILEUID:{{newFileUID}}\r\n\r\n";
var signonMessageSet = '<SIGNONMSGSRQV1>'+
    '<SONRQ>'+
    '<DTCLIENT>{{shortOfxDate clientDate}}'+
    '<USERID>{{userid}}'+
    '<USERPASS>{{userpass}}'+
    '<LANGUAGE>ENG'+
    '<FI>'+
    '<ORG>{{org}}'+
    '<FID>{{fid}}'+
    '</FI>'+
    '<APPID>{{appid}}'+
    '<APPVER>{{appver}}'+
    '</SONRQ>'+
    '</SIGNONMSGSRQV1>';

var ccMessageSetRequest = '<CREDITCARDMSGSRQV1>'+
    '{{> ccStatementRequest}}' +
    '</CREDITCARDMSGSRQV1>';

var ccStatementRequest = 	'<CCSTMTTRNRQ>'+
    '<TRNUID>{{uuid 32}}'+
    '{{#cltcookie}}<CLTCOOKIE>{{this}}{{/cltcookie}}'+
    '<CCSTMTRQ>'+
    '<CCACCTFROM>'+
    '<ACCTID>{{accountNumber}}'+
    '</CCACCTFROM>'+
    '<INCTRAN>'+
    '{{#startAt}}<DTSTART>{{ofxDate this}}{{/startAt}}'+
    '<INCLUDE>{{includeTransactions}}'+
    '</INCTRAN>'+
    '</CCSTMTRQ>'+
    '</CCSTMTTRNRQ>';

var bankMessageSetRequest =	'<BANKMSGSRQV1>'+
    '{{> bankStatementRequest}}' +
    '</BANKMSGSRQV1>';

var bankStatementRequest = 	'<STMTTRNRQ>'+
    '<TRNUID>{{uuid 32}}'+
    '{{#cltcookie}}<CLTCOOKIE>{{this}}{{/cltcookie}}'+
    '<STMTRQ>'+
    '<BANKACCTFROM>'+
    '<BANKID>{{routingNumber}}'+
    '<ACCTID>{{accountNumber}}'+
    '<ACCTTYPE>{{accountType}}'+
    '</BANKACCTFROM>'+
    '<INCTRAN>'+
    '{{#startAt}}<DTSTART>{{ofxDate this}}{{/startAt}}'+
    '<INCLUDE>{{includeTransactions}}'+
    '</INCTRAN>'+
    '</STMTRQ>'+
    '</STMTTRNRQ>';
var ofxBankStatementRequest = '{{> ofxHeader}}<OFX>{{> signonMessageSet}} {{> bankMessageSetRequest}}</OFX>';
var ofxBankStatementRequestTemplate = handlebars.compile(ofxBankStatementRequest);
var ofxCreditCardStatementRequest = '{{> ofxHeader}}<OFX>{{> signonMessageSet}} {{> ccMessageSetRequest}}</OFX>';
var ofxCreditCardStatementRequestTemplate = handlebars.compile(ofxCreditCardStatementRequest);

handlebars.registerPartial('ofxHeader', ofxHeader);
handlebars.registerPartial('signonMessageSet', signonMessageSet);
handlebars.registerPartial('bankMessageSetRequest', bankMessageSetRequest);
handlebars.registerPartial('bankStatementRequest', bankStatementRequest);
handlebars.registerPartial('ccMessageSetRequest', ccMessageSetRequest);
handlebars.registerPartial('ccStatementRequest', ccStatementRequest);
handlebars.registerHelper('uuid', function(length){
    return ofxutils.uuid(length);
});
handlebars.registerHelper('shortOfxDate', function(date){
    return ofxutils.toShortOfxDate(date);
});
handlebars.registerHelper('ofxDate', function(object){
    return ofxutils.toOFXDate(object);
});


var supportedAccountTypes = {
    CHECKING : ofxBankStatementRequestTemplate,
    SAVINGS: ofxBankStatementRequestTemplate,
    MONEYMRKT: ofxBankStatementRequestTemplate,
    CREDITLINE: ofxBankStatementRequestTemplate,
    CREDITCARD: ofxCreditCardStatementRequestTemplate
};

/**
 * Build an OFX statement request for an account
 *
 * @param institute - information about the bank or financial institute
 * @param account - account information
 * @param options - options for getting the statement
 * @return {*}
 */
exports.buildStatementRequest = function (account, options) {

    //Create copy so that we can inject default properties without
    //changing parameters
    var accountInfoCopy = _.clone(account);
    var optionsCopy = _.clone(options);

    //Validate parameters
    schema.validateAccount(accountInfoCopy);
    schema.validateRequestOptions(optionsCopy);

    var template = supportedAccountTypes[account.accountType];
    var templateInfo = _.defaults(accountInfoCopy, ofxDefaults, optionsCopy);

    return template(templateInfo);
};


