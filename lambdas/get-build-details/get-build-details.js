// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()
var s3 = new AWS.S3()

var params = require("./params")

// Set the region
AWS.config.update({region: params.REGION});

module.exports.handler = async (event) => {
  try {
    var buildId = event.pathParameters.buildId
    var getItemParams = {
      TableName: 'BuildMetadata',
      Key: {
        'BuildId' : {S: buildId}
      }
    };

    var item = await dynamodb.getItem(getItemParams, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    }).promise();

    var bucketParams = {
      Bucket: params.BUCKET_NAME,
      Prefix: buildId
    }

    var s3Results = await s3.listObjects(bucketParams, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    }).promise()


    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        build: item,
        artifacts: s3Results.Contents
      }),
    }
  } catch(e) {
    console.log("Exception:", e)
    console.log('Event: ', event);
    return {
      statusCode: 500,
      body: "Exception thrown during execution. See log for details " +  e
    }
  }
}