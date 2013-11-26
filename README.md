Plataphorma
===========

Meteor pet project for demoing the following functionality: 

* Collection's publish/subscribe 
* Deps.autorun 
* Meteor.methods/call 
* Integration of non-Meteor code in compatibility folder (HTML5 games Alien Invasion and Froot Wars)
* Usage of allow to control client access to collections

When run, Plataphorma offers the possibility to run 2 different games. A chat is available when no game is selected, and a different chat is available while playing each of the games. 

When a game is finished the points are published on the right side. 


The two HTML5 games are available here:

* Alien Invasion: https://github.com/cykod/AlienInvasion
* Froot Wars: http://www.wrox.com/WileyCDA/WroxTitle/Professional-HTML5-Mobile-Game-Development.productCd-1118301323,descCd-DOWNLOAD.html


Running the project
-------------------

A live version of this code is running here: http://plataphorma.meteor.com

To run the project locally, clone the repo and run meteor inside it. You can see in .meteor/packages that this Meteor project uses these packages:
* meteor remove autopublish
* meteor remove insecure
* meteor add bootstrap
* meteor add accounts-ui
* meteor add accounts-password


