var express = require('express');
var router = express.Router();

/* GET messages page. */
router.get('/', function(req, res) {
    var db = req.db;
    db.messages.find(function (err, docs){
        res.render('messages', {
        	"title" : "Messages",
            "itemType" : "message",
            "messages" : docs
        });
    });
});

/* GET messages send page. */
router.get('/send/:contactId', function(req, res) {
    var db = req.db;
    var contactId = req.params.contactId;
    var ObjectId = req.ObjectId;
    db.contacts.findOne({ "_id": ObjectId(contactId)}, function (err, docs){
        res.render('message_send', {
        	"title" : "Send Message",
            "buttonLabel" : "Send Message",
            "contact" : docs
        });
    });
});

/* GET messages send ALL page. */
router.get('/send/all', function(req, res) {
    var db = req.db;
    res.send( '<a href="/">Home</a><br />' + 'Send ALL Page' );
    // db.messages.find(function (err, docs){
    //     res.render('messages', {
    //     	"title" : "Messages",
    //         "messages" : docs
    //     });
    // });
});

/* GET messages send ALL page. */
router.get('/send/group/:groupId', function(req, res) {
    var db = req.db;
    var groupId = req.params.groupId;
    var twilioClient = req.ObjectId;
    res.send( '<a href="/">Home</a><br />' + 'Send ALL Page ' + groupId );
    // db.messages.find(function (err, docs){
    //     res.render('messages', {
    //     	"title" : "Messages",
    //         "messages" : docs
    //     });
    // });
});

/* POST send a single message. */
router.post('/send/', function(req, res) {
    var db = req.db;
    var contactId = req.body.contactId;
    // var mobilenumber = req.body.mobilenumber;
    var message = req.body.message;
    var twilioClient = req.twilioClient;

    // store the message info in the database
    db.messages.insert( {
        message: message,
        dateSent: new Date()
    },
    function (err, docs){
        if( err )
        {
            res.send('An error occurred when saving the message <br>' + message );
            return false;
        }
        SendTextMessage( res, req, docs._id.toString(), contactId );
        res.status(200).send('<html><body></body><script type="text/javascript">window.location.href="/messages";</script></html>');
    });

});

function SendTextMessage( res, req, messageId, contactId )
{
    // get the contact details from the db
    var db = req.db;
    var ObjectId = req.ObjectId;
    db.contacts.findOne({ "_id": ObjectId(contactId)}, function (err, contact){

        // select a mobile number
        var mobilenumber = contact.personalmobile;
        if( contact.workmobile != '' && contact.personalmobile.length >= 11 )
        {
            mobilenumber = contact.workmobile;
        }
        console.log( mobilenumber );

        // get the message from the db
        db.messages.findOne({ "_id": ObjectId(messageId)}, function (err, message){

            // send Text Message
            // twilioClient.sms.messages.create({
            //     to: '+447990580010', // mobilenumber
            //     from: '+441384901523',
            //     body: message.message
            // }, function(error, sentMessage) {
            //     // The HTTP request to Twilio will run asynchronously. This callback
            //     // function will be called when a response is received from Twilio
            //     // The "error" variable will contain error information, if any.
            //     // If the request was successful, this value will be "falsy"
            //     if (!error) {
            //         // The second argument to the callback will contain the information
            //         // sent back by Twilio for the request. In this case, it is the
            //         // information about the text messsage you just sent:
            //         console.log('Success! The SID for this SMS message is:');
            //         console.log(sentMessage.sid);
             
            //         console.log('Message sent on:');
            //         console.log(sentMessage.dateCreated);

            //         // store the recipient info in the database
            db.message_recipients.insert( {
                messageid: messageId,
                contactid: contactId
            },
            function (err, docs){
                if( err )
                {
                    // res.send('An error occurred when saving the recipient <br>' + contactId );
                    // return false;
                }
                
            });

            //     } else {
            //         console.log('Oops! There was an error.');
            //     }
            // });
        });
    });

}

module.exports = router;
