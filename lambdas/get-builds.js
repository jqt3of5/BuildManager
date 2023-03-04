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
  
  console.log('starting lambda')
  let responseMessage = 'Hello, World!';

  var params = {
    TableName: 'BuildMetadata',
    // Specify which items in the results are returned.
    // FilterExpression: "Subtitle = :topic AND Season = :s AND Episode = :e",
    // Define the expression attribute value, which are substitutes for the values you want to compare.
    // ExpressionAttributeValues: {
    //   ":topic": {S: "SubTitle2"},
    //   ":s": {N: 1},
    //   ":e": {N: 2},
    // },
    // Set the projection expression, which are the attributes that you want.
    // ProjectionExpression: "Season, Episode, Title, Subtitle",
  };

  var items = await dynamodb.scan(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      return data.Items
      console.log("Success", data);
    }
  }).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      builds: items,
    }),
  }
}