const db = require('./models/index.js');

module.exports = (message, slashCommand) => {
  db.Lunch.findOne({
    where: {
      team: message.team_id,
      channel: message.channel_id,
      finished: false,
    }
  }).then(lunch => {
    if (!lunch) {
      slashCommand.replyPrivate(message, 'no open lunch for this channel');
      return;
    }

    db.User.create({
      user: message.user_name,
    }).then(u => {
      u.setLunch(lunch).then(() => {
        slashCommand.replyPublic(message, `<@${message.user_name}> joined lunch!`);
      });
    });
  });
};
