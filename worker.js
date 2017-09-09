const Queue = require('bull');
const https = require('https');
const lib = require('lib');

var queue = new Queue('lunch', process.env.REDIS_URL);

console.log('setup');
queue.process(function(job, done){
  console.log(job.data);
  const {
    msg,
    channel,
    team,
    type,
  } = job.data;

  // jsonObject = JSON.stringify({
  //   type : type,
  // });
  //
  // // prepare the header
  // var postheaders = {
  //     'Content-Type' : 'application/json',
  //     'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
  // };
  //
  // // the post options
  // var optionspost = {
  //     host : 'shem.lib.id',
  //     port : 443,
  //     path : `/lunchtime@dev/webhook/channel/?channel=${channel}&team_id=${team}`,
  //     method : 'POST',
  //     headers : postheaders
  // };
  //
  // https.request(optionspost, (res) => {
  //   console.log('STATUS: ' + res.statusCode);
  //   console.log('HEADERS: ' + JSON.stringify(res.headers));
  //   res.setEncoding('utf8');
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //   });
  //   done();
  // }).end();

  lib.shem.lunchtime['@dev'].webhook({
    channel: channel,
    team_id: team,
    type: type,
  }, function (err, result) {
    if (err) {
      console.log('err: ' + err);
      return;
    }
    console.log('result: ' + result);
  });
});

queue.on('error', function(error) {
  console.log(`error: ${error}`);
})

queue.on('failed', function(job, err){
  console.log(`failed: ${err}`);
})

console.log('listenting');
