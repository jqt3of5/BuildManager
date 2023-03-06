// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()

var params = require("./params")

// Set the region
AWS.config.update({region: params.REGION});

module.exports.handler = async (event) => {
  try {
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
  } catch(e) {
    console.log("Exception:", e)
    console.log('Event: ', event);
    return {
      statusCode: 500,
      body: "Exception thrown during execution. See log for details"
    }
  }
}