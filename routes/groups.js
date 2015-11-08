var express = require('express');
var router = express.Router();

/* GET groups page. */
router.get('/', function(req, res) {
    var db = req.db;
    // var ObjectId = req.ObjectId;
    db.groups.find(function (err, groups){

        // SORT OUT THE COUNT PROPERLY
        var Idx = 0;
        for( var gIdx in groups )
        {
            db.group_members.find({ "groupid": groups[gIdx]._id.toString() }, {"memberid": 1}, function (err, members){
                groups[Idx].membercount = members.length;
                if( gIdx >= (groups.length-1) )
                {
                    res.render('groups', {
                        "title" : "Groups",
                        "itemType" : "group",
                        "groups" : groups
                    });
                }
                Idx++;
            });
        }
    });
});

/* GET add a new group page. */
router.get('/add', function(req, res) {
    res.render('group_add', {
    	"title" : "Add New Group",
    	"editmode" : 0,
        "buttonLabel" : "Save New Group"
    });
});

/* POST save a new contact page. */
router.post('/save', function(req, res) {
    var db = req.db;
    var groupId = req.body.groupId;
    function updateGroup()
    {
        db.groups.update( findObj, {
            groupname: req.body.groupname,
            description: req.body.description
        },
        {upsert: true},
        function (err, docs){
            if( err )
            {
                res.send('An error occurred when saving group <br>' + req.body.groupname +' <br>'+ req.body.description);
                return false;
            }
            res.redirect('/groups');
        });
    }

    if( groupId )
    {
    	// used when editing a contact
    	var ObjectId = req.ObjectId;
    	var findObj = {"_id" : ObjectId(req.body.groupId)};
        updateGroup();
    }
    else
    {
    	// used when saving a new contact
    	var findObj = {"groupname" : req.body.groupname};
        db.groups.find(findObj, function (err, docs){
            if( docs.length )
            {
                // Already a contact with that groupname
                res.send( 'Already a group with that name (' + req.body.groupname + ')' );
                return false;
            }
            else
            {
                // User doesn't exist so create a new contact
                updateGroup();
            }
        });
    }
});

/* GET edit a group page. */
router.get('/edit/:groupId', function(req, res) {
    var db = req.db;
    var ObjectId = req.ObjectId;
    db.groups.findOne({ "_id": ObjectId(req.params.groupId)}, function (err, docs){
	    res.render('group_add', {
	    	"title" : "Edit Group",
            "editmode" : 1,
	        "buttonLabel" : "Save Group",
            "groups" : docs
	    });
    });
});

/* GET delete a group page. */
router.get('/delete/:groupId', function(req, res) {
    var db = req.db;
    var ObjectId = req.ObjectId;
    db.groups.remove({ "_id": ObjectId(req.params.groupId)}, function (err, docs){
        res.redirect('/groups');
    });
});

/* GET change group contacts page. */
router.get('/contacts/:groupId', function(req, res) {
    var db = req.db;
    var ObjectId = req.ObjectId;
    var groupId = ObjectId(req.params.groupId);

	db.groups.findOne({ "_id": groupId}, function (err, group){
        res.render('group_contacts', {
        	"title" : "Group contacts",
            "group" : group
        });
    });
});

/* POST list contacts and group members for editing. */
router.post('/listforedit/', function(req, res) {

    var db = req.db;
    var ObjectId = req.ObjectId;
    var groupid = req.body.groupid;

    db.contacts.find(function (err, contacts){
        db.group_members.find({ "groupid": groupid }, {"memberid": 1}, function (err, members){

            memberContacts = [];
            for( var mIdx in members )
            {
                var memberid = members[mIdx].memberid;
                var findObj = { "_id": ObjectId(memberid)}
                db.contacts.findOne( findObj, function (err, membercontact){
                    
                    memberContacts.push(membercontact);
                    for( var cIdx in contacts )
                    {
                        if( contacts[cIdx]._id.toString() == membercontact._id.toString() )
                        {
                            contacts.splice(cIdx, 1);
                        }
                    }

                    if( memberContacts.length === members.length )
                    {
                        return res.json({
                            "groupid"   : groupid,
                            "contacts"  : contacts,
                            "members"   : memberContacts
                        });
                    }
                });
            }
            
        });
    });
});

/* POST test. */
router.post('/editsave/', function(req, res) {

    var db = req.db;
    var groupid = req.body.groupid
    var members = req.body.members;

    var findObj = {"groupid" : groupid};
    db.group_members.remove( findObj, function(){
        for( var mIdx in members )
        {
            db.group_members.insert( {
                "groupid": groupid,
                "memberid": members[mIdx]._id
            },
            function (err, docs){
                if( err )
                {
                    res.send('An error occurred when saving group members');
                    return false;
                }
            });
        }
        return res.json({ "redirect": "/groups" });
    });


});

module.exports = router;
