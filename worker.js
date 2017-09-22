const Queue = require('bull');
const https = require('https');
const lib = require('lib');
const models = require("./models.js");

var triggerQ = new Queue('trigger', process.env.REDIS_URL);
var reminderQ = new Queue('reminder', process.env.REDIS_URL);
var finishQ = new Queue('finish', process.env.REDIS_URL);

function split(array) {
  array.sort(() => Math.random() * 2 - 1);
  return array.reduce(function(result, value, index, array) {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, []);
}

function getStr(array) {
  return array.map(i => `<@${i[0]}> <=> <@${i[1]}>`)
}

function handleMsg(job, done, msg) {
  console.log(msg);
  console.log(job.data);
  const {
    channel,
    team,
  } = job.data;

  lib.shem.lunchtime['@dev'].webhook({
    channel: channel,
    team_id: team,
    msg: msg,
  }, function (err, result) {
    if (err) {
      console.log('err: ' + err);
      done();
      return;
    }
    console.log('result: ' + result);
    done();
  });
}

console.log('setup');
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
    models.lunch.findOne({
      where: {
        team: team,
        channel: channel,
        finished: false,
      }
    }).then(lunch => {
      lunch.getUsers({ attributes: ['user'] }).then(users => {
        const count = [...new Set(users.map(u => u.user))].length;
        handleMsg(job, done, `lunch almost here, ${count} already joined!`);
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
    console.log(lunch);
    lunch.finished = true;
    lunch.save();
    lunch.getUsers({ attributes: ['user'] }).then(users => {
      splits = split([...new Set(users.map(u => u.user))]);
      handleMsg(job, done, `Here we go: ${getStr(splits)}`);
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

console.log('listenting');
