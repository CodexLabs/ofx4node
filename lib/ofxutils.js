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

var crypto = require('crypto');
var Buffer = require('buffer').Buffer;
var moment = require('moment');
var _ = require('underscore');


/**
 * Left-pad a number with zeros so that it's at least the given
 * number of characters long
 * @param n   The number to pad
 * @param len The desired length
 */
function padLeft(n, len, pad) {
    if(_.isUndefined(n)) n = '';
    if(_.isUndefined(n)) len = 0;
    if(_.isUndefined(n)) pad = ' ';
    return (new Array(len - String(n).length + 1)).join(pad).concat(n);
}


/**
 * Converts an OFX date to ISO8601 date
 * @param ofxDate date to convert
 * @return {String}
 */
exports.toISODate = function (ofxDate) {
    var date = [];
    date.push(ofxDate.slice(0,4));//year
    date.push('-');
    date.push(ofxDate.slice(4,6));//month
    date.push('-');
    date.push(ofxDate.slice(6,8));//day
    date.push('T');
    date.push(padLeft(ofxDate.slice(8,10), 2, '0'));//hour
    date.push(':');
    date.push(padLeft(ofxDate.slice(10,12), 2, '0'));//minute
    date.push(':');
    date.push(padLeft(ofxDate.slice(12,14), 2, '0'));//second
    date.push('.');
    date.push(padLeft(ofxDate.slice(15,18), 3, '0'));//millisecond

    var tz = ofxDate.split(/.*\[([+-])?([0-9]{1,2})\.?([0-9]{0,2}).*\]/g);
    if(tz.length > 1) {
        var intVal = parseInt(tz[2]); //hours
        if(intVal) {
            date.push(tz[1]); //sign
            date.push(padLeft(tz[2], 2, '0')); //hours
            date.push(padLeft(tz[3], 2, '0')); //minutes
        }
        else {
            date.push('Z');
        }
    }
    else {
        date.push('Z');
    }

    return date.join('');
};

/**
 * Converts a date or a string to OFX formatted date
 * @param date date object or string representing a date
 * @return {*}
 */
exports.toOFXDate = function (date) {
    return moment(date).utc().format('YYYYMMDDHHmmss.SSS');
};


exports.toShortOfxDate = function (date) {
    return moment(date).utc().format('YYYYMMDD');
};

/**
 * Unique Id Generator
 *
 * @param {number} length
 * @return {string} radix
 * @return {string} uuid
 * @api private
 */
exports.uuid = function(len,radix) {
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var chars = CHARS, uuid = [];
    radix = radix || chars.length;

    if (len) {
        for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        for (var i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
};

var ENCRYPTION_METHOD = 'aes256';
var ENCRYPTION_OUTPUT = 'hex';
var ENCRYPTION_ENCODING = 'utf8';

exports.encrypt = function(password, secret) {
    secret = secret || '';
    var cipher = crypto.createCipher(ENCRYPTION_METHOD, secret);
    var cryptedPassword = cipher.update(password, ENCRYPTION_ENCODING,ENCRYPTION_OUTPUT);
    cryptedPassword += cipher.final(ENCRYPTION_OUTPUT);
    return  cryptedPassword;
};

exports.decrypt = function(password, secret) {
    secret = secret || '';
    var decipher = crypto.createDecipher(ENCRYPTION_METHOD, secret);
    var decryptedPassword = decipher.update(password, ENCRYPTION_OUTPUT,ENCRYPTION_ENCODING);
    decryptedPassword += decipher.final(ENCRYPTION_ENCODING);
    return decryptedPassword;

}