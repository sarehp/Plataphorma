/*******************************************************************************
 *   Subscriptions to collections published by the server
 */

// Meteor.users is a collection automatically created in the server by
// user_password package. This subscription gives the client access to
// the usernames of all users, published by the server as Meteor.users
Meteor.subscribe("userNames");

// Subscription to have access to the Games collection.
Meteor.subscribe("all_games");


/*
 *  Session.get() is a reactive data source. Thanks to Deps.autorun,
 *  the function passed as a parameter is rerun automatically
 *  everytime the session variable current_game changes (i.e. when
 *  user clicks on a new game button).
 */
Deps.autorun(function(){
    var current_game = Session.get("current_game");

    // The server will publish a different Messages collection to the
    // client, including only messages of current_game
    Meteor.subscribe("messages_current_game", current_game);

    // The server will publish a different Matches collection to the
    // client, including only matches of current_game
    Meteor.subscribe("matches_current_game", current_game);
});




/*******************************************************************************
 *   Startup code on the client
 */
Meteor.startup(function(){
    Session.set("current_game", "none");
    $('#gamecontainer').hide();
    $('#container').hide();

    $(document).on("click", ".alert .close", function(e) {
	$(this).parent().hide();
    });
});



/*******************************************************************************
 *  For illustration purpose: Meteor.userId() is a reactive data source.  
 *  Thanks to Deps.autorun, the function passed as a parameter will be rerun
 *  automatically every time the user id changes (i.e. when user signs
 *  in and signs off
 */
var currentUser = null;
Deps.autorun(function(){
    console.log("current user: " + currentUser);
    currentUser = Meteor.userId();
    console.log("current user: " + currentUser);
});




/*******************************************************************************
 *  Template helper functions
 */


Template.messages.messages = function () {

    var messagesColl =  Messages.find({}, { sort: { time: -1 }});
    var messages = [];

    messagesColl.forEach(function(m){
	var userName = Meteor.users.findOne(m.user_id).username;
	messages.push({name: userName , message: m.message});
    });

    return messages;
}

Template.input.events = {
    'keydown input#message' : function (event) {
	if (event.which == 13) { 
	    if (Meteor.userId()){
		var user_id = Meteor.user()._id;	    
		var message = $('#message');
		if (message.value != '') {
		    Messages.insert({
			user_id: user_id,
			message: message.val(),
			time: Date.now(),
			game_id: Session.get("current_game")
		    });
		    message.val('')
		}
	    }
	    else {
		$("#login-error").show();
	    }
	}
    }
}
    

Template.choose_game.games = function (){
    return Games.find();
}

Template.choose_game.events = {
    'click #AlienInvasion': function () {
	$('#gamecontainer').hide();
	$('#container').show();
	var game = Games.findOne({name:"AlienInvasion"});
	Session.set("current_game", game._id);
    },
    'click #FrootWars': function () {
	$('#container').hide();
	$('#gamecontainer').show();
	var game = Games.findOne({name:"FrootWars"});
	Session.set("current_game", game._id);
    },
    'click #none': function () {
	$('#container').hide();
	$('#gamecontainer').hide();
	Session.set("current_game", "none");
    }
}


Template.best_players.none = function (){
    return Session.get("current_game") == "none";
}

Template.best_players.gameName = function (){
    var game_id = Session.get("current_game");
    if (game_id)
	var game_name = Games.findOne({_id: game_id}).name;
    return game_name;
}


Template.chat.none = function (){
    return Session.get("current_game") == "none";
}

Template.chat.gameName = function (){
    var game_id = Session.get("current_game");
    if (game_id)
	var game_name = Games.findOne({_id: game_id}).name;
    return game_name;
}


Template.best_players.best_players = function (){
    var matches =  Matches.find({}, {limit:5, sort: {points:-1}});
    
    var users_data = [];
    
    matches.forEach (function (m) {
   	var user = Meteor.users.findOne({_id: m.user_id});
  	if (user){
	    var game = Games.findOne({_id: m.game_id});
   	    users_data.push({name: user.username, game: game.name, points: m.points});
  	}
    });
    
    return users_data;
}



/*******************************************************************************
*  Configuration of signup 
*/
Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});



