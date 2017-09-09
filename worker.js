const Queue = require('bull');
const https = require('https');
const lib = require('lib');

var triggerQ = new Queue('trigger', process.env.REDIS_URL);
var reminderQ = new Queue('reminder', process.env.REDIS_URL);
var finishQ = new Queue('finish', process.env.REDIS_URL);

function handleMsg(job, done, q) {
  console.log(q);
  console.log(job.data);
  const {
    msg,
    channel,
    team,
    type,
  } = job.data;

  lib.shem.lunchtime['@dev'].webhook({
    channel: channel,
    team_id: team,
    type: type,
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
  handleMsg(job, done, 'trigger');
});
reminderQ.process(function(job, done){
  handleMsg(job, done, 'reminder');
});
finishQ.process(function(job, done){
  handleMsg(job, done, 'finish');
});

queue.on('error', function(error) {
  console.log(`error: ${error}`);
})

queue.on('failed', function(job, err){
  console.log(`failed: ${err}`);
})

console.log('listenting');
