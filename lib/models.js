/**
*  Collections 
*/

Messages = new Meteor.Collection('messages');

Games = new Meteor.Collection('games');

Matches = new Meteor.Collection('matches');

// For exporting certain attributes of the Meteor.users collection to
// all clients. By default, Meteor.collection only publishes the
// document of the connected
ConnectedUsers = new Meteor.Collection('connectedusers');

