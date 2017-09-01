var Queue = require('bull');

var audioQueue = new Queue('audio transcoding', {redis: {port: 6379, host: '127.0.0.1', password: 'foobared'}}); // Specify Redis connection using object

audioQueue.process(function(job, done){
  // transcode audio asynchronously and report progress
  job.progress(42);

  // call done when finished
  done();

  // or give a error if error
  done(new Error('error transcoding'));

  // or pass it a result
  done(null, { samplerate: 48000 /* etc... */ });

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error');
});
