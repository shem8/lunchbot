const db = require('./models/index.js');
const Queue = require('bull');

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

  db.LunchTemplate.findAll({
    where: {
      team: message.team_id,
      channel: message.channel_id,
      canceled: false,
    }
  }).then(templates => {
    templates.forEach(t => cancel(t));

    slashCommand.replyPrivate(message, 'lunch cacnceled');
  });
};
