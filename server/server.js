/*******************************************************************************
 *  Publish collections
 */
Meteor.publish("userNames", function() {
    // publish only the field username of every user
    return Meteor.users.find ({}, {fields: {username:1}});
});


Meteor.publish("matches_current_game", function(current_game){
    var game_criteria;

    if (current_game == "none")
	game_criteria = {};
    else 
	game_criteria = {game_id: current_game};

    // publish every field of the latest 5 matches sorted by points in
    // descending order
    return Matches.find(game_criteria, 
			{limit:5, sort: {points:-1}});
    
});


Meteor.publish("messages_current_game", function (current_game) {
    // publish every field of the latest 10 messages sorted by time in
    // descending order
    return Messages.find({game_id: current_game}, 
			 {limit:10, sort: {time:-1}});
    
});


Meteor.publish("all_games", function () {
    // publish every field of every game
    return Games.find();
});



/*******************************************************************************
 *  Defines functions that can be invoked over the network by clients.
 *
 */
Meteor.methods({
    matchFinish: function (game, points) {
	// Don't insert in the Matches collection a match if the user
	// has not signed in
	if (this.userId)
	    Matches.insert ({user_id: this.userId, 
			     time_end: Date.now(),
			     points: points,
			     game_id: game
			    });
    }
});




/*******************************************************************************
 *  Definition of permissions for users trying to write directly to
 *  collections
 */

// Aux function used in Messages.allow
function adminUser(userId) {
    var adminUser = Meteor.users.findOne({username: "admin"});
    return (userId && adminUser && userId === adminUser._id);
}

// Permissions for client trying to access Messages collection
Messages.allow({
    insert: function(userId, doc){
	// Only authenticated users can insert messages
	return Meteor.userId();
    },
    remove: function (userId, docs){
        // Only admin user can remove chat messages.
        // No UI for this, you can test from console
	return adminUser(userId);
    }
});


/*******************************************************************************
 *  Initialization at startup
 */
Meteor.startup(function() {
    // At startup, fill collection of games if it's empty
    if (Games.find().count() == 0) {
	Games.insert({name: "FrootWars"});
	Games.insert({name: "AlienInvasion"});
    };

});
