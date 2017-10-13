const db = require('./models/index.js');

module.exports = (message, slashCommand) => {

  db.LunchTemplate.find({
    where: {
      team: message.team_id,
      channel: message.channel_id,
    }
  }).then(templates => {
    if (!templates) {
      slashCommand.replyPrivate(message, 'no open lunch for this channel');
      return;
    }

    const [triggerKey, reminderKey, finishKey] = template.keys;
    const trigger = triggerQ.removeRepeatable(opts = {
        repeat: {cron: triggerKey},
      });
      const reminder = reminderQ.removeRepeatable(opts = {
        repeat: {cron: reminderKey},
      });

      const finish = finishQ.removeRepeatable(opts = {
        repeat: {cron: finishKey},
      });

      slashCommand.replyPrivate(message, 'lunch was cacnceled');
    });
    });
  });
};
