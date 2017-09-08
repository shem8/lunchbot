var Queue = require('bull');
const https = require('https');

var queue = new Queue('lunch', process.env.REDIS_URL);

console.log('setup');
queue.process(function(job, done){
  // transcode audio asynchronously and report progress
//  job.progress(42);

  // call done when finished
//  done();

  // or give a error if error
//  done(new Error('error transcoding'));

  // or pass it a result
//  done(null, { samplerate: 48000 /* etc... */ });

  // If the job throws an unhandled exception it is also handled correctly
//  throw new Error('some unexpected error');
  console.log('test');
  console.log(job.data);
  const {
    msg,
    channel,
    team,
  } = job.data;

  const url = `https://shem.lib.id/lunchtime@dev/webhook/channel/?channel=${channel}&team_id=${team}`;
  console.log(url);

  https.get(url, (res) => {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
    done();
  }).end();

console.log('end');

});

queue.on('error', function(error) {
  console.log(`error: ${error}`);
})

queue.on('failed', function(job, err){
  console.log(`failed: ${err}`);
})

console.log('listenting');
