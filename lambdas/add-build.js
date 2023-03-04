// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()
//
// Set the AWS Region.
const REGION = "us-west-2"; //e.g. "us-east-1"
// Set the region
AWS.config.update({region: REGION});

module.exports.handler = async (event) => {
  console.log('Event: ', event);

  //TODO: validate parameters
  var params = {
    TableName: 'BuildMetadata',
    Item: {
      'CommitHash' : {S: event.commitHash},
      'BuildConfiguration' : {S: event.buildConfiguration},
      'BuildNumber' : {N: event.buildNumber},
      'BranchName' : {S: event.branchName},
    }
  };

// Call DynamoDB to add the item to the table
  await dynamodb.putItem(params, function(err, data) {
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
      message: "",
    }),
  }
}