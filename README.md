# ofx4node [![Build Status](https://secure.travis-ci.org/krush/ofx4node.png)](http://travis-ci.org/krush/ofx4node)

ofx4node is a library for downloading statements from financial institutes like banks and credit card companies.

##Install it
Install it using NPM:
```
npm install ofx4node
```
##Use it
The simplest way to use the library is to call `ofx4node.downloadStatement()` like this:

```js
var ofx4node = require('ofx4node');

var institute = {
  url : 'https://yourbank.com/ofx',
  userid : 'your user id',
  userpass : 'your password',
  org : 'MYBANK',
  fid : '01234'
};

var account = {
  accountType: 'SAVINGS',
  accountNumber: '098-121',
  routingNumber: '987654321'
};

var options = {
  startAt : '2013-01-01T00:00:00Z'
}

ofx4node.downloadStatement(institute,account,options,function(error,ofx){
  //do something with your statement
});
```
###Institutes, Accounts, and Options
There are JSON schemas created for each of these so that you can see what information is required. The schemas can be found in lib/schema.js.

####Institute Information
You can find the information needed to create an institute instance at [Ofx Home] (http://www.ofxhome.com/index.php/home/directory).

###Sample OFX Statement JSON
This is an example of the ofx object that would be passed to the callback function in the above code. This example is generated from the OFX in the test/test.ofx file. 
```json
{
  "signonmsgsrsv1": {
		"sonrs": {
			"status": {
				"code": "0",
				"severity": "INFO"
			},
			"dtserver": "20071015021529.000[-8:PST]",
			"language": "ENG",
			"dtacctup": "19900101000000",
			"fi": {
				"org": "MYBANK",
				"fid": "01234"
			}
		}
	},
	"bankmsgsrsv1": {
		"stmttrnrs": {
			"trnuid": "23382938",
			"status": {
				"code": "0",
				"severity": "INFO"
			},
			"stmtrs": {
				"curdef": "USD",
				"bankacctfrom": {
					"bankid": "987654321",
					"acctid": "098-121",
					"accttype": "SAVINGS"
				},
				"banktranlist": {
					"dtstart": "20070101",
					"dtend": "20071015",
					"stmttrn": [
						{
							"trntype": "CREDIT",
							"dtposted": "20070315",
							"dtuser": "20070315",
							"trnamt": "200.00",
							"fitid": "980315001",
							"name": "DEPOSIT",
							"memo": "automatic deposit"
						},
						{
							"trntype": "CREDIT",
							"dtposted": "20070329",
							"dtuser": "20070329",
							"trnamt": "150.00",
							"fitid": "980310001",
							"name": "TRANSFER",
							"memo": "Transfer from checking"
						},
						{
							"trntype": "PAYMENT",
							"dtposted": "20070709",
							"dtuser": "20070709",
							"trnamt": "-100.00",
							"fitid": "980309001",
							"checknum": "1025",
							"name": "John Hancock"
						}
					]
				},
				"ledgerbal": {
					"balamt": "5250.00",
					"dtasof": "20071015021529.000[-8:PST]"
				},
				"availbal": {
					"balamt": "5250.00",
					"dtasof": "20071015021529.000[-8:PST]"
				}
			}
		}
	}
}
```
#Plumbing
The `downloadStatement()` method is the porcelain for the ofx4node module which is built on top of an OFX parser and an OFX Request Builder. The plumbing is also exposed so that you can have finer control over how OFX requests are built and the resulting OFX is parsed.

##OFX Parser
The OFX parser can be used if you need or want to control how the OFX is marshalled in to Javascript objects. 

###Events
As the parser works, it emits events when it has finished parsing an agregrate or element (see OFX spec for the definitions of these). You can listen for these events to control how objects are built. Here is an example which adds transactions to an object with a friendlier property name:

```js
       var p = ofxparser.createParser({
            lowercasetags:true
        });
        p.on('stmttrn', function (value, parentObject) {
            if(_.isUndefined(parentObject.transactions)) {
                parentObject.transactions = [];
            }
            parentObject.transactions.push(value);
            parentObject.stmttrn = undefined;
        });
        p.on('stmtrs', function(object){
            expect(object).toBeDefined();
            expect(object.banktranlist.transactions).toBeDefined();
            expect(object.banktranlist.transactions.length).toBe(3);
        });
        p.on('ofx', function(){
            done();
        });
        fs.createReadStream('./test/test.ofx', { encoding: "utf8" }).pipe(p);
```        

###Streaming
It is basically a stream which you can pipe data into. This makes it easy to parse OFX from a variety of source streams like files, http responses, etc. 

##OFX Request Builder
The request builder uses handlebars under the covers to generate OFX documents which can be submitted to financial institutions. You can use it like this:
```js
var ofx = ofx4node.buildStatementRequest(institute, account, options);
request({
  url:institute.url,
  headers:{ 'Content-Type':ofxContentType },
  body: ofx
}, function(error, response, body){
  //handle the result? Maybe pass to ofx parser
});
```
