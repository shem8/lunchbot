var Queue = require('bull');

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
  done();

});
console.log('listenting');
