// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()

var params = require("./params")

// Set the region
AWS.config.update({region: params.REGION});

module.exports.handler = async (event) => {

  try {
    var body = JSON.parse(event.body)
    var buildId = event.pathParameters.buildId
    var query = {
      TableName: 'BuildMetadata',
      Item: {
        'BuildId': {S: buildId},
      }
    }
    var item = await dynamodb.getItem(query, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    }).promise()

    //ITem doesn't exist with buildId
    if (item == null)
    {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buildId: body.buildId,
          message: "specified item doesn't exist"
        }),
      }
    }

    //copy over every property
    for (const property in body) {
      item[property] = body[property]
    }

// Call DynamoDB to add the item to the table
    await dynamodb.putItem(item, function(err, data) {
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
        //TODO: Sanitize the buildId
        buildId: body.buildId,
        bucketPath: params.BUCKET_URL + body.buildId,
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