const db = require('./models/index.js');

const triggerQ = new Queue('trigger', process.env.REDIS_URL);
const reminderQ = new Queue('reminder', process.env.REDIS_URL);
const finishQ = new Queue('finish', process.env.REDIS_URL);

function cancel(template) {
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

  template.canceled = true;
  template.save();
}

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

    templates.each(t => cancel(t));

    slashCommand.replyPrivate(message, 'lunch cacnceled');
  });
};
