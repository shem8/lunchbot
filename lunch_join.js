const db = require('./models/index.js');

module.exports = (message, slashCommand) => {

  db.LunchTemplate.findOne({
    where: {
      team: message.team_id,
      channel: message.channel_id,
    }
  }).then(template => {
    if (!template) {
      slashCommand.replyPrivate(message, 'no open lunch for this channel');
      return;
    }
    template.getLunches({
      where: {
        finished: false,
      },
    }).then(lunches => {
      if (!lunches) {
        slashCommand.replyPrivate(message, 'no open lunch for this channel');
        return;
      }

      db.User.create({
        user: message.user_name,
        lunch_id: lunches[0].id,
      }).then(() => {
        slashCommand.replyPublic(message, `<@${message.user_name}> joined lunch!`);
      });
    });
  });
};
