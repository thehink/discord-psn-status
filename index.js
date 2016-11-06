const Discord = require('discord.js');
const Psn = require('psn-api');
const client = new Discord.Client();
const Config = require('./config.json');

let psn = new Psn(Config.psn_email, Config.psn_password);

let prevGame = null;
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
        console.log('updating game!', prevGame, game);
        prevGame = game;
        client.user.setGame(game);
      }
  })
  .catch(error => {
      console.log(error);
  });
}

psn.login().then(profile => {
    client.on('ready', () => {
      console.log('I am ready!');
      //client.user.setStatus('online');
      checkOnlineStatus();
      setInterval(checkOnlineStatus, 1000*60*1);
    });

    client.login(Config.discord_email, Config.discord_password);
})
.catch(error => {
    console.log(error);
});
