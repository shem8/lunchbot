const Queue = require('bull');
const slack = require('slack');
const models = require('./models.js');

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

module.exports = (message, slashCommand) => {
  const [dayStr, timeStr] = message.text.split(' ');

  console.log(process.env.BOT_USER_ACCESS_TOKEN);
  slack.users.info({
    token: process.env.BOT_USER_ACCESS_TOKEN,
    user: message.user_id,
  },
  (err, data) => {
    if (err) {
      console.log(err);
      slashCommand.replyPrivate(message, 'something went wrong');
      return;
    }
    var day = parseDay(dayStr);
    var time = parseHour(timeStr);
    [ time.hour, day ] = substractHour(time.hour, day, data.user.tz_offset / SECONDS_IN_HOUR);

    const [ triggerHour, triggerDay ] = substractHour(time.hour, day, TRIGGER_BEFORE_HOUR);
    const trigger = triggerQ.add(data = {
      channel: message.channel_id,
      team: message.team_id,
      type: 'trigger'
    },
    opts = {
      repeat: {cron: `0 ${time.minute} ${triggerHour} * * ${triggerDay}`},
    });
    console.log(`trigger: 0 ${time.minute} ${triggerHour} * * ${triggerDay}`)

    const [ reminderMinute, reminderHour, reminderDay ] =
      substractMinute(time.minute, time.hour, day, REMINDER_BEFORE_MINUTE);
    const reminder = reminderQ.add(data = {
      channel: message.channel_id,
      team: message.team_id,
      type: 'reminder'
    },
    opts = {
      repeat: {cron: `0 ${reminderMinute} ${reminderHour} * * ${reminderDay}`},
    });
    console.log(`reminder: 0 ${reminderMinute} ${reminderHour} * * ${reminderDay}`)

    const finish = finishQ.add(data = {
      channel: message.channel_id,
      team: message.team_id,
      type: 'finish'
    },
    opts = {
      repeat: {cron: `0 ${time.minute} ${time.hour} * * ${day}`},
    });
    console.log(`finish: 0 ${time.minute} ${time.hour} * * ${day}`)

    Promise.all([trigger, reminder, finish]).then(function(resolve, reject){
      slashCommand.replyPublic(message,
        `Great, I'll be responsible for managing the lunch time on ${timeStr}, ${dayStr}`);
    });
  });
};
