
var Snoocore = require('snoocore');
var fs = require('fs');
var yt = require('youtube-info');

var secrets = new Map(JSON.parse(fs.readFileSync('./secrets.json', 'utf-8')));
var moderated = Array.from(JSON.parse(fs.readFileSync('./moderated.json', 'utf-8')));




var bot = new Snoocore({
  userAgent: '/u/Overwatchmemes_bot 1.0',
  oauth: {
    type: 'script',
    key: secrets.get("key"), // OAuth client key (provided at reddit app)
    secret: secrets.get("secret"), // OAuth secret (provided at reddit app)
    username: 'overwatchmemes_bot', // Reddit username used to make the reddit app
    password: secrets.get("pass"), // Reddit password for the username
    scope: [ 'identity', 'read', 'submit', 'edit', 'report', 'modposts' ]
  }
});

var doIt = false;
var id = new String();

bot('/r/overwatchmemes/new').listing({
  limit:30
}).then(function(result){
  result.children.forEach(function(value){
    //conditions that make me not want to check a post
    if(value.data.approved)//post already approved, no action needed
      return;
    if(value.data.removed)//post already removed, no action needed
      return;

    if(value.data.domain === 'youtube.com'){
      id = value.data.url.substring(32);
      doIt = true;
    }
    if(value.data.domain === 'youtu.be'){
      id = value.data.url.substring(17);
      doIt = true;
    }

    if (doIt) {
      yt(id).then(function(details){
         if (details.duration > 120) {
           bot('/api/remove').post({id: value.data.name, spam: true});
         }else if(details.duration > 60){
           bot('/api/report').post({reason: 'The video is between 1 and 2 minutes: human judgement required', id:value.data.name});
         }

       })
       .catch(function(err){
         bot('/api/report').post({reason: 'This post is a video but I can\'t see its duration', id:value.data.name});
       });
       doIt = false;
    }
  });
});


