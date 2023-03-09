// import {lambda} from "@aws-sdk/lambda";
const AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB()

var params = require("./params")

// Set the region
AWS.config.update({region: params.REGION});

module.exports.handler = async (event) => {

  try {
    var body = JSON.parse(event.body)
    //TODO: validate parameters
    var item = {
      TableName: 'BuildMetadata',
      Item: {
        'BuildId' : {S: body.buildId},
        'CommitHash' : {S: body.commitHash},
        'BuildConfiguration' : {S: body.buildConfiguration},
        'BuildNumber' : {N: body.buildNumber},
        'BranchName' : {S: body.branchName},
        'BuildStartDate' : {N: body.buildStarted},
        'BucketPath' : {S: params.BUCKET_URL},
        'Uploaded' : {BOOL: body.uploaded ?? false},
        'BuildUrl' : {S: body.buildUrl}
      }
    };
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