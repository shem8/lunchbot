const Queue = require('bull');
const https = require('https');
const lib = require('lib');
const slack = require('slack');
const models = require('./models.js');
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

function handleMsg(job, done, msg) {
  const {
    team,
    channel,
  } = job.data;

  slackbot.storage.teams.get(team, (err, { token }) => {
    slack.chat.postMessage({
      token: token,
      channel: channel,
      text: msg,
    });
    done();
  });
}

triggerQ.process(function(job, done){
  const {
    channel,
    team,
  } = job.data;
  models.lunch.create({
    team: team,
    channel: channel,
  });

  handleMsg(job, done, `lunch day! use \`/lunch_join\` for joining lunch`);
});

reminderQ.process(function(job, done){
    const {
      channel,
      team,
    } = job.data;
  
    models.lunch.findOne({
      where: {
        team: team,
        channel: channel,
        finished: false,
      }
    }).then(lunch => {
      lunch.getUsers({ attributes: ['user'] }).then(users => {
        const count = [...new Set(users.map(u => u.user))].length;
        if (count == 0) {
          handleMsg(job, done, `lunch almost here, but no one joined yet!`);
        } else {
          handleMsg(job, done, `lunch almost here, ${count} already joined!`);
        }
      });
    });
});

finishQ.process(function(job, done){
  const {
    channel,
    team,
  } = job.data;

  models.lunch.findOne({
    where: {
      team: team,
      channel: channel,
      finished: false,
    }
  }).then(lunch => {
    if (!lunch) {
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
