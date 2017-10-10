const Queue = require('bull');
const https = require('https');
const lib = require('lib');
const slack = require('slack');
const db = require('./models/index.js');
const slackbot = require('./slackbot.js');

const triggerQ = new Queue('trigger', process.env.REDIS_URL);
const reminderQ = new Queue('reminder', process.env.REDIS_URL);
const finishQ = new Queue('finish', process.env.REDIS_URL);

const GROUP_SIZE = 3;

function split(array) {
  array.sort(() => Math.random() * 2 - 1);
  return array.reduce(function(result, value, index, array) {
    if (index % GROUP_SIZE === 0) {
      if (index == array.length - (GROUP_SIZE + 1)) {
        result.push(array.slice(index, index + (GROUP_SIZE - 1)));
        result.push(array.slice(index + (GROUP_SIZE - 1), index + (GROUP_SIZE + 1)));
      } else if (index != array.length - 1) {
        result.push(array.slice(index, index + GROUP_SIZE));
      }
    }
    return result;
  }, []);
}

function getStr(array) {
  return array.map(i => `<@${i[0]}> <=> <@${i[1]}>`).join('\n');
}

function handleMsg(lunch, done, msg) {
  console.log(lunch);

  lunch.getLunchTemlpate().then((template) => {
    slackbot.storage.teams.get(lunch.LunchTemplate.team, (err, { token }) => {
      slack.chat.postMessage({
        token: token,
        channel: lunch.LunchTemplate.channel,
        text: msg,
      });
      done();
    });
  });
}

triggerQ.process(function(job, done){
  const {
    lunch_template_id,
  } = job.data;

  db.Lunch.create({
    LunchTemplateId: lunch_template_id
  }).then((lunch) => {
    handleMsg(lunch, done, `lunch day! use \`/lunch_join\` for joining lunch`);
  });
});

reminderQ.process(function(job, done){
    const {
      lunch_template_id,
    } = job.data;

    db.Lunch.findOne({
      where: {
        LunchTemplateId: lunch_template_id,
        finished: false,
      }
    }).then(lunch => {
      if (!lunch) {
        //Unsubscribe?
        done();
        return;
      }
      lunch.getUsers({ attributes: ['user'] }).then(users => {
        const count = [...new Set(users.map(u => u.user))].length;
        if (count == 0) {
          handleMsg(lunch, done, `lunch almost here, but no one joined yet!`);
        } else {
          handleMsg(lunch, done, `lunch almost here, ${count} already joined!`);
        }
      });
    });
});

finishQ.process(function(job, done){
  const {
    lunch_template_id,
  } = job.data;
  db.Lunch.findOne({
    where: {
      LunchTemplateId: lunch_template_id,
      finished: false,
    }
  }).then(lunch => {
    if (!lunch) {
      //Unsubscribe?
      done();
      return;
    }
    lunch.finished = true;
    lunch.save();
    lunch.getUsers({ attributes: ['user'] }).then(users => {
      const userNames = [...new Set(users.map(u => u.user))];
      if (userNames.length <= 1) {
        handleMsg(job, done, 'Not enough people joined lunch =(');
      } else {
        splits = split(userNames);
        handleMsg(job, done, `Here we go:\n${getStr(splits)}`);
      }
    });
  });

});

triggerQ.on('error', function(error) {
  console.log(`error: ${error}`);
});
triggerQ.on('failed', function(job, err){
  console.log(`failed: ${err}`);
});
reminderQ.on('error', function(error) {
  console.log(`error: ${error}`);
});
reminderQ.on('failed', function(job, err){
  console.log(`failed: ${err}`);
});
finishQ.on('error', function(error) {
  console.log(`error: ${error}`);
});
finishQ.on('failed', function(job, err){
  console.log(`failed: ${err}`);
});
