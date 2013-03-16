
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

var request = require('request');
var ofxbuilder = require('./ofxbuilder');
var ofxparser = require('./ofxparser');
var ofxutils = require('./ofxutils');
var _ = require('underscore');
var domain = require('domain');
var util = require('util');

var parserSettings = {
    lowercasetags : true
};

var ofxContentType = 'application/x-ofx';
var ofx4node = {};

/**
 * Export plumbing so that it can be used directly
 */
ofx4node.createParser = ofxparser.createParser;
ofx4node.buildStatementRequest = ofxbuilder.buildStatementRequest;
ofx4node.toShortOfxDate = ofxutils.toShortOfxDate;
ofx4node.toOFXDate = ofxutils.toOFXDate;
ofx4node.toISODate = ofxutils.toISODate;

/**
 * Export flags to indicate whether to log request/response
 */
ofx4node.logOfxRequest = false;
ofx4node.logOfxResponse = false;

/**
 * Downloads a statement from a financial institute.
 *
 * @param institute - connection information about the bank or financial institute
 * @param account - account information
 * @param options - options
 * @param callback - function that will  be called with the results.
 * @return {*}
 */
ofx4node.downloadStatement = function (institute, account, options, callback) {

    options = options || {};
    if(_.isFunction(options)) {
        callback = options;
        options = {};
    }

    var ofxdomain = domain.create();
    ofxdomain.on('error', function(error){
        callback(error);
    });

    ofxdomain.run(function(){
        var parser = ofx4node.createParser(parserSettings);
        parser.on('ofx', function(ofx) {
            callback(null, ofx);
        });
        ofx4node.createDownloadStream(institute,account,options).pipe(parser);
    });
};

/**
 * Creates a download stream for the statement. This can be used to
 * pipe output from stream to an instance of OfxParser
 *
 * @param institute - required institute parameter
 * @param account - required account paramter
 * @param options - optional options
 * @return {*} readable stream
 */
ofx4node.createDownloadStream = function(institute, account, options) {
    options = options || {};
    var requestOptions = {
        url:institute.url,
        headers:{ 'Content-Type':ofxContentType },
        body: ofx4node.buildStatementRequest(institute, account, options)
    };

    logRequest(requestOptions);
    return request.post(requestOptions).on('response', responseHandler);
};

/**
 * Helper function to handle responses from http server
 * @param response
 */
var responseHandler = function(response) {
    if(response.statusCode >= 300) {
        logResponse(response, response.body);
        throw new Error('Invalid status code returned from server: ' + response.statusCode);
    }
    if(ofxContentType !== response.headers['content-type']) {
        logResponse(response, response.body);
        throw new Error('Invalid content type returned from server: ' + response.headers['content-type']);
    }

    logResponse(response, response.body);
};

/**
 * Helper function to log http response
 *
 * @param response
 * @param body
 */
var logResponse = function(response, body) {
    if(ofx4node.logOfxResponse) {
        console.log('OFX Response: %j', _.pick(response, 'statusCode', 'headers'));
        if(body) {
            console.log('Body: \n %s', body);
        }
    }
};

/**
 * Helper function to log request
 *
 * @param request
 */
var logRequest = function(request) {
    if(ofx4node.logOfxRequest) {
        console.log('OFX Request: %j', _.omit(request, 'body'));
        console.log('Body: \n %s', request.body);
    }
};

module.exports = ofx4node;
