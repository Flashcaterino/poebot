// Variables from Configuration file
var config = require("../config.js");

var gamepediaAPI = config.gamepediaAPI;
var exileBot = config.exileBot;
var htmlparser = config.htmlparser;
var request = config.request;

// Gets top 10 for some given league
function getLadder(ladderId, msg){
  // Get league list, first of all
  getLeagueList(function(leagueNames){

    // Messy ES2015 check to see if ladderId is a valid league
    if (leagueNames.findIndex(item => ladderId.toLowerCase() === item.toLowerCase()) < 0) {
      var responseText = "<b>Current Leagues: </b>\n";

      leagueNames.forEach(name => {
        responseText += `${name}\n`;
      });

      exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
      return;
    }else{
      // Get top 10
      request.get(`http://api.pathofexile.com/ladders/${ladderId}?limit=10`, function(err,res,body){
        if(err){
          exileBot.sendMessage(msg.chat.id, "Something went wrong while accessing the ladder you wanted.");
        }

        if(res.statusCode == 200 ){
          var data = JSON.parse(res.body);

          var responseText = `<b>Showing top 10 players in ${ladderId} league:</b>\n`;
          var char = {};

          data.entries.forEach(ladderEntry => {
            char = ladderEntry.character;

            responseText += `<b>${ladderEntry.rank}.</b> ${char.name}(${ladderEntry.account.challenges.total}) - lvl ${char.level} ${char.class}\n`;
          });

          exileBot.sendMessage(msg.chat.id, responseText, {parse_mode: "HTML"});
        }

      });
    } //else

  });
}

// Returns main league names
function getLeagueList(callback){
  request.get('http://api.pathofexile.com/leagues?type=main', function(err,res,body){
    if(err){
      return [];
    }

    if(res.statusCode == 200 ){
      var data = JSON.parse(res.body);
      var leagueNames = [];

      data.forEach(league => {
        leagueNames.push(league.id);
      });

      if (typeof callback === "function") {
        callback(leagueNames);
      }

    }
  });
}

exports.Ladder = getLadder;
