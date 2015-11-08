var express = require('express');
var router = express.Router();

/* GET contacts page. */
router.get('/', function(req, res) {
    var db = req.db;
    db.contacts.find(function (err, docs){
        res.render('contacts', {
        	"title" : "Contacts",
            "itemType" : "contact",
            "contacts" : docs
        });
    });
});

/* GET add a new contact page. */
router.get('/add', function(req, res) {
    res.render('contact_add', {
    	"title" : "Add New Contact",
        "editmode" : 0,
        "buttonLabel" : "Save New Contact"
    });
});

/* POST save a new contact page. */
router.post('/save', function(req, res) {
    var db = req.db;
    var contactId = req.body.contactId;
    function updateContact()
    {
        db.contacts.update( findObj, {
            username: req.body.username,
            firstname: req.body.firstname,
            workmobile: req.body.workmobile,
            personalmobile: req.body.personalmobile,
            active: 1
        },
        {upsert: true},
        function (err, docs){
            if( err )
            {
                res.send('An error occurred when saving contact <br>' + req.body.username +' <br>'+ req.body.firstname +' <br>'+ req.body.workmobile +' <br>'+ req.body.personalmobile);
                return false;
            }
            res.redirect('/contacts');
        });
    }

    if( contactId )
    {
    	// used when editing a contact
    	var ObjectId = req.ObjectId;
    	var findObj = {"_id" : ObjectId(req.body.contactId)};
        updateContact();
    }
    else
    {
    	// used when saving a new contact
    	var findObj = {"username" : req.body.username};
        db.contacts.find(findObj, function (err, docs){
            if( docs.length )
            {
                // Already a contact with that username
                res.send( 'Already a contact with that username (' + req.body.username + ')' );
                return false;
            }
            else
            {
                // User doesn't exist so create a new contact
                updateContact();
            }
        });
    }
});

/* GET edit a contact page. */
router.get('/edit/:contactId', function(req, res) {
    var db = req.db;
    var ObjectId = req.ObjectId;
    db.contacts.findOne({ "_id": ObjectId(req.params.contactId)}, function (err, docs){
	    res.render('contact_add', {
	    	"title" : "Edit Contact",
            "editmode" : 1,
	        "buttonLabel" : "Save Contact",
            "contacts" : docs
	    });
    });
});

/* GET delete a contact page. */
router.get('/delete/:contactId', function(req, res) {
    var db = req.db;
    var ObjectId = req.ObjectId;
    db.contacts.remove({ "_id": ObjectId(req.params.contactId)}, function (err, docs){
        res.redirect('/contacts');
    });
});

module.exports = router;
