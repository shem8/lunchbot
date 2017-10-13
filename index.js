const Botkit = require('botkit');
const join = require('./lunch_join.js');
const start = require('./lunch_start.js');
const cancel = require('./lunch_cancel.js');
const controller = require('./slackbot.js');

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('slash_command', function (slashCommand, message) {
  if (message.token !== process.env.SLACK_VERIFICATION_TOKEN) return; //just ignore it.

  switch (message.command) {
    case '/lunch_join':
      join(message, slashCommand);
      return
    case '/lunch_start':
      start(message, slashCommand);
      return;
    case '/lunch_cancel':
      cancel(message, slashCommand);
      return
    default:
      slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");
  }
});
