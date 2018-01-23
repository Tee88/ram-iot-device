const awsIot = require('aws-iot-device-sdk');
const os = require('os')




const device = awsIot.device({
  keyPath: "./certificates/a45aefa0c2-private.pem.key",
  certPath: "./certificates/a45aefa0c2-certificate.pem.crt",
  caPath: "./certificates/VeriSign-Class 3-Public-Primary-Certification-Authority-G5.pem",
  clientId: "ram-reader_002",
  host: "a328ephb9wkpfr.iot.eu-central-1.amazonaws.com",
  protocol: "wss",
  port: 443
  // accessKeyId: "<AWS_ACCESS_KEY_ID>",
  // secretKey: "<AWS_SECRET_ACCESS_KEY>",
});
  // for security reasons its better to add the accessKeyId and secretKey
  //to env variables by running this in reminal :
  // export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
  // export export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
  // Each shell session keeps track of its own shell and environmental variables.
  // so if you terminate the shell, run the lines above again.

function Timer(fn, t) {
  var timerObj = setInterval(fn, t);

  this.stop = function() {
      if (timerObj) {
          clearInterval(timerObj);
          timerObj = null;
      }
      return this;
  }

  // start timer using current settings (if it's not already running)
  this.start = function() {
      if (!timerObj) {
          this.stop();
          timerObj = setInterval(fn, t);
      }
      return this;
  }

  // start with new interval, stop current interval
  this.reset = function(newT) {
      t = newT;
      return this.stop().start();
  }
}


let sendUsage = new Timer (()=>{
  device.publish('ram', JSON.stringify({
    totalMemory: os.totalmem(),
    usedMemory: os.freemem(),
    timeStamp: new Date()
  }))
},5000)

device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('user');
    sendUsage.start()
  });

device
  .on('message', function(topic, payload) {
    let userMessage = JSON.parse(payload.toString())
    if (userMessage.message === "stop"){
      sendUsage.stop();
    }else if(userMessage.message === "start"){
      sendUsage.start();
    }
  });
