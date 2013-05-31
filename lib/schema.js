
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

var jsonGate = require('json-gate');


var accountSchema = {
    type: 'object',
    properties : {
        //required
        accountNumber : {
            type : 'string',
            required : true,
            maxLength: 22
        },
        accountType : {
            type : 'string',
            required : true,
            enum : ['CHECKING', 'SAVINGS', 'MONEYMRKT', 'CREDITLINE', 'CREDITCARD']
        },

        //required
        userid : {
            type : 'string',
            maxLength : 32,
            required : true
        },
        userpass : {
            type : 'string',
            maxLength : 171,
            required : true
        },

        //optional
        routingNumber : {
            type : 'string',
            maxLength : 9
        },
        org : {
            type : 'string',
            maxLength : 32
        },
        fid : {
            type : 'string',
            maxLength : 32
        },
        url : {
            type : 'string',
            format : 'uri'
        },
        appver : {
            type : 'string',
            default : '2100'
        },
        appid : {
            type : 'string',
            default : 'QWIN'
        }
    }
};

var requestOptionsSchema = {
    type : 'object',
    properties : {
        startAt : {
            type : 'string',
            format : 'date-time'
        },
        endAt : {
            type : 'string',
            format : 'date-time'
        },
        includeTransactions : {
            type : 'string',
            enum : ['Y', 'N'],
            default : 'Y'
        }
    }
};

exports.validateRequestOptions = function(options) {
    jsonGate.createSchema(requestOptionsSchema).validate(options);
};


exports.validateAccount = function(account) {
    jsonGate.createSchema(accountSchema).validate(account);
};

