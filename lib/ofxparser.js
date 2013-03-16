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

var sax = require("sax"),
    util = require('util'),
    _ = require('underscore'),
    events = require('events');

var ofx = {};
ofx.createParser = function(options) {
    return new OFXParser(options);
};

ofx.OFXParser = OFXParser;
module.exports = ofx;

/**
 * OFXParser that parses ugly ofx xml into objects. This class inherits from
 * sax.SAXStream in order to parse the ofx 'xml'. It handles SAX events
 * to create objects.
 *
 * This parser fires events to allow clients to interact with the building
 * of the objects. It emits an event for every element and aggregate it finds
 * during the parsing. Clients can listen for those events and change either the
 * value of the object or the name of the property in the parent object.
 *
 * Every event passes an object as a parameter and the object has a name
 * property and a value property. Listeners can change these as desired.
 *
 *
 * @param options
 * @constructor
 */
function OFXParser(options) {

    var self = this;
    self.options = _.defaults({normalize:true, trim:true}, options || {});

    //Strict is set to false so that SAX can handle
    //the fact that OFX does not include closing tags
    sax.SAXStream.call(self, false, self.options);

    //Stack to hold tags while parsing
    self.stack = [];

    //Listen to SAX Events
    self.on('text', self.handleText );
    self.on('opentag', self.handleOpenTag);
    self.on('closetag', self.handleCloseTag );

};

util.inherits(OFXParser, sax.SAXStream);

/**
 * Converts string of headers like below to the headers object
 * where each name/value pair are properties on the object.
 *
 * Sample header text:
 * OFXHEADER:100
 * DATA:OFXSGML
 * VERSION:102
 * SECURITY:NONE
 * ENCODING:USASCII
 * CHARSET:1252
 * COMPRESSION:NONE
 * OLDFILEUID:NONE
 * NEWFILEUID:NONE
 *
 * @param text string of headers
 */
OFXParser.prototype.handleHeaders = function(text) {
    var self = this;
    //headers
    self.headers = {};
    var strings = text.split(/\s/);
    strings.forEach(function(value,i) {
        var p = value.split(/(\w+):(.+)/);
        self.headers[p[1]] = p[2];
    });
};

/**
 * Called when SAX has text event. It assumes:
 * - if no objects on stack then text is headers and passed to handleHeaders function
 * - OFX elements with text will have no end element, so it acts like it got one.
 * - Text is trimmed and normalized
 *
 * It will build an object from the object on top of the stack using the name
 * of the object as the name parameter and the text as the value parameter. The
 * parent object will be the grandparent of the text.
 *
 * This basically builds OFX elements
 *
 * @param text
 */
OFXParser.prototype.handleText = function (text) {
    var self = this;
    if(text.trim().length > 0) {
        if(_.isEmpty(self.stack)) {
            self.handleHeaders(text);
        }
        else {
            var currentObject = self.stack.pop();
            var parentObject = _.last(self.stack);
            if(typeof currentObject !== 'undefined' && typeof parentObject !== 'undefined') {
                currentObject.value = text;

                //Set the value of the current object on the parent
                self.createObject(currentObject.name, currentObject.value, parentObject.value);
            }
        }
    }
};

/**
 * Called when SAX detects an opening tag. It will add
 * properties to hold the object's name and value  which
 * will be used later while creating the object for this tag.
 *
 * @param node
 */
OFXParser.prototype.handleOpenTag = function (node) {
    var self = this;
    self.stack.push({name: node.name, value: {}});
};

/**
 * Called when SAX detects a closing tag. It ignores
 * closing tags if the tag's name does not match the
 * current tag on the stack. This is done because the
 * SAX parser will detect a closing tag in cases where one
 * does not exist.
 *
 * It emits an event for every matched closing tag. This
 * means that it emits events for OFX aggregates.
 *
 * @param tagName - name of tag that is being closed.
 */
OFXParser.prototype.handleCloseTag = function(tagName) {
    var self = this;
    if(tagName === _.last(self.stack).name) {
        var currentObject = self.stack.pop();
        var parentObject = _.last(self.stack);
        if(parentObject) {
            self.createObject(currentObject.name, currentObject.value, parentObject.value);
        }
        else {
            self.createObject(currentObject.name, currentObject.value);
        }

    }
};

/**
 * Default factory method that adds the value as a property
 * on the parent object.
 *
 * @param name
 * @param value
 * @param parentObject
 */
OFXParser.prototype.createObject = function (name, value, parentObject) {
    var self = this;
    if(parentObject) {
        //Does parentObject already have this value?
        if (!(name in parentObject)) {
            //No so create a property on parentObject
            parentObject[name] = value;
        } else if (!util.isArray(parentObject[name])) {
            //Yes but it was not an Array so this is second child of parent
            //So convert existing property into a new array
            var newArray = [parentObject[name]];

            //Add this value to the new array
            newArray.push(value);

            //Change parent's property to point to new array
            parentObject[name] = newArray;
        } else {
            //Yes and there is already an array so just add this one to it
            parentObject[name].push(value);
        }
    }
    self.emit(name, value, parentObject);
};
