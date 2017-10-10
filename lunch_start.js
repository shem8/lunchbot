const Queue = require('bull');
const slack = require('slack');
const slackbot = require('./slackbot.js');

const triggerQ = new Queue('trigger', process.env.REDIS_URL);
const reminderQ = new Queue('reminder', process.env.REDIS_URL);
const finishQ = new Queue('finish', process.env.REDIS_URL);

const TRIGGER_BEFORE_HOUR = 2;
const REMINDER_BEFORE_MINUTE = 10;
const SECONDS_IN_HOUR = 60 * 60;

function parseDay(day) {
  switch (day) {
    case "Sunday":
    case "Sun":
        return 0;
    case "Monday":
    case "Mon":
        return 1;
    case "Tuesday":
    case "Tue":
        return 2;
    case "Wednesday":
    case "Wed":
        return 3;
    case "Thursday":
    case "Thu":
        return 4;
    case "Friday":
    case "Fri":
        return 5;
    case "Saturday":
    case "Sat":
        return 6;
    default:
        return -1;
    }
}

function parseHour(time) {
  const [hour, minute] = time.split(':');
  return {
    hour: hour,
    minute: minute,
  };
}

function substractHour(hour, day, sub) {
  let retHour = hour - sub;
  let retDay = day;
  if (retHour < 0) {
      retHour += 24;
      retDay = (retDay - 1 + 7) % 7;
  }
  return [ retHour, retDay ];
}

function substractMinute(minute, hour, day, sub) {
    let retMinute = minute - sub;
    let retHour = hour;
    let retDay = day;
    if (retMinute < 0) {
        retMinute += 60;
        [ retHour, retDay ] = substractHour(retHour, day, 1);
    }

    return [ retMinute, retHour, retDay ];
}

function calcCrons(text, tz_offset) {
    const [dayStr, timeStr] = text.split(' ');
    const day = parseDay(dayStr);
    const time = parseHour(timeStr);
    [ time.hour, day ] = substractHour(time.hour, day, tz_offset / SECONDS_IN_HOUR);

    const [ triggerHour, triggerDay ] = substractHour(time.hour, day, TRIGGER_BEFORE_HOUR);
    const [ reminderMinute, reminderHour, reminderDay ] =
      substractMinute(time.minute, time.hour, day, REMINDER_BEFORE_MINUTE);

    const triggerKey = `0 ${time.minute} ${triggerHour} * * ${triggerDay}`;
    const reminderKey = `0 ${reminderMinute} ${reminderHour} * * ${reminderDay}`;
    const finishKey = `0 ${time.minute} ${time.hour} * * ${day}`;

    return [triggerKey, reminderKey, finishKey];
}

function scheduleCrons(template, [triggerKey, reminderKey, finishKey], slashCommand) {
  const trigger = triggerQ.add(data = {
    lunch_template_id: template.id,
  },
  opts = {
    repeat: {cron: triggerKey},
  });
  const reminder = reminderQ.add(data = {
    lunch_template_id: template.id,
  },
  opts = {
    repeat: {cron: reminderKey},
  });

  const finish = finishQ.add(data = {
    lunch_template_id: template.id,
  },
  opts = {
    repeat: {cron: finishKey},
  });

  return Promise.all([trigger, reminder, finish]);
}

module.exports = (message, slashCommand) => {

  slackbot.storage.teams.get(message.team_id, (err, { token }) => {
    slack.users.info({
      token: token,
      user: message.user_id,
    },
    (err, data) => {
      if (err) {
        console.log(err);
        slashCommand.replyPrivate(message, 'something went wrong');
        return;
      }

      const keys = calcCrons(message.text, data.user.tz_offset);

      db.LunchTemplate.create({
        team: message.team_id,
        channel: message.channel_id,
        keys: keys,
        args: message.text,
      }).then((template) => {

        scheduleCrons(template, keys).then(() => {
          slashCommand.replyPublic(message,
            `Great, I'll be responsible for managing the lunch time on ${timeStr}, ${dayStr}`);
        });
      });
    });
  });
};
