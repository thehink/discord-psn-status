const Discord = require('discord.js');
const Psn = require('psn-api');
const Config = require('./config.json');

const client = new Discord.Client({
  fetchAllMembers: false,
  disableEveryone: true
});

let psn = new Psn(Config.psn_email, Config.psn_password);
let prevGame = null;
let checkTimeout = null;

const delayCheckOnlineStatus = ms => {
  if(checkTimeout){
    clearTimeout(checkTimeout);
  }
  checkTimeout = setTimeout(checkOnlineStatus, ms);
}

const checkOnlineStatus = () => {
  psn.getProfile({
      user: "me"
  }, {
      fields: ["onlineId", "presences(@titleInfo,hasBroadcastData)"],
  })
  .then(resp => {
      const presence = resp.profile.presences[0];
      let game = null;
      if(presence.onlineStatus === 'online'){
        game = presence.titleName + (presence.gameStatus ? ', ' + presence.gameStatus : '');
      }

      if(prevGame !== game){
        console.log('[Update]', prevGame, '=>', game);
        prevGame = game;
        client.user.setGame(game);
      }

	  if(presence.onlineStatus === 'online'){
		  //Update status every minute if online
		  //console.log('[Online]', 'Updating in 60 seconds');
		  delayCheckOnlineStatus(1000*60);
	  }else{
		  //update status every 10 minutes if offline
		  //console.log('[Offline]', 'Updating in 10 minutes');
		  delayCheckOnlineStatus(1000*60*10);
	  }
  })
  .catch(error => {
    console.log(error);
	  console.log('Error', 'Updating in 20 minutes');
	  delayCheckOnlineStatus(1000*60*20); //wait 20 mins if we got an error
  });
}

psn.login().then(profile => {
    client.on('ready', () => {
      console.log('Connected to discord!');
      //client.user.setStatus('online');
      checkOnlineStatus();
      //setInterval(checkOnlineStatus, 1000*60*1);
    });

    client.on('disconnect', e => {
      if(checkTimeout){
        clearTimeout(checkTimeout);
        checkTimeout = null;
      }
      console.log('Disconnected from discord!', e);
    });

    client.login(Config.discord_token);
})
.catch(error => {
    console.log(error);
});
