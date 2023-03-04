// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dyanmodb = new AWS.DyanamoDB()
//
// Set the AWS Region.
const REGION = "us-west-2"; //e.g. "us-east-1"
// Set the region
AWS.config.update({region: REGION});

module.exports.handler = async (event) => {
  console.log('Event: ', event);
  let responseMessage = 'Hello, World!';

  var params = {
    TableName: 'BuildMetadata',
    Item: {
      'CommitHash' : {S: '1234567'},
    }
  };

// Call DynamoDB to add the item to the table
  ddb.putItem(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: responseMessage,
    }),
  }
}