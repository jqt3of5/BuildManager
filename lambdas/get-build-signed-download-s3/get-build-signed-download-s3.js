// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()

var params = require("./params")

// Set the region
AWS.config.update({region: params.REGION});

module.exports.handler = async (event) => {
  console.log('Event: ', event);
  
  var params = {
    TableName: 'BuildMetadata',
  };

  var items = await dynamodb.scan(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  }).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      builds: items.Items,
    }),
  }
}