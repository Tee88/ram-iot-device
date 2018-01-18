const awsIot = require('aws-iot-device-sdk');
const os = require('os')




const device = awsIot.device({
  keyPath: "./certificates/b398943c6a-private.pem.key",
  certPath: "./certificates/b398943c6a-certificate.pem.crt",
  caPath: "./certificates/VeriSign-Class 3-Public-Primary-Certification-Authority-G5.pem",
  clientId: "ram-reader_001",
  host: "a328ephb9wkpfr.iot.us-west-2.amazonaws.com",
  protocol: "wss",
  accessKeyId: "AKIAI4QNLVRUMXPW5NNA",
  secretKey: "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",
  port: 443
});

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
  device.publish('ram', JSON.stringify({message: `memory useage ${os.freemem()} out of ${os.totalmem()}`}))
},1000)

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
