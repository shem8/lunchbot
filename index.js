// SLACK_APP_NAME=lunch-time
// SLACK_OAUTH_SCOPE=bot,commands,chat:write:bot,chat:write:user,files:write:user,channels:history,users:read
// SLACK_REDIRECT=https://shem.lib.id/lunchtime@dev/auth/
// BOT_USER_ACCESS_TOKEN=xoxb-235033916868-iIFolOPaxclHOK9V2dIUQ4aR

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

if (!process.env.SLACK_CLIENT_ID || !process.env.SLACK_CLIENT_SECRET || !process.env.PORT || !process.env.SLACK_VERIFICATION_TOKEN) {
      console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
      process.exit(1);
}

var controller = Botkit.slackbot({
  json_file_store: './db_slackbutton_slash_command/',
}).configureSlackApp({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: process.env.SLACK_OAUTH_SCOPE,
});

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

//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {
    console.log(message);
    switch (message.command) {
        case "/cancel_lunch": //handle the `/echo` slash command. We might have others assigned to this app too!
            // The rules are simple: If there is no text following the command, treat it as though they had requested "help"
            // Otherwise just echo back to them what they sent us.

            // but first, let's make sure the token matches!
            if (message.token !== process.env.SLACK_VERIFICATION_TOKEN) return; //just ignore it.

            // if no text was supplied, treat it as a help command
            if (message.text === "" || message.text === "help") {
                slashCommand.replyPrivate(message,
                    "I echo back what you tell me. " +
                    "Try typing `/echo hello` to see.");
                return;
            }

            // If we made it here, just echo what the user typed back at them
            //TODO You do it!
            slashCommand.replyPublic(message, "1", function() {
                slashCommand.replyPublicDelayed(message, "2").then(slashCommand.replyPublicDelayed(message, "3"));
            });

            break;
        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");

    }

})
;
