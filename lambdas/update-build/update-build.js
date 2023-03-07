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
    //TODO: validate parameters
    var item = {
      TableName: 'BuildMetadata',
      Item: {
        'BuildId': {S: buildId},
        'CommitHash' : body.commitHash === undefined ? undefined : {S: body.commitHash},
        'BuildConfiguration' :  body.buildConfiguration === undefined ? undefined :{S: body.buildConfiguration},
        'BuildNumber' :  body.buildNumber === undefined ? undefined :{N: body.buildNumber},
        'BranchName' :  body.branchName === undefined ? undefined :{S: body.branchName},
        'BuildStartDate' :  body.buildStarted === undefined ? undefined :{N: body.buildStarted},
        'Uploaded' :  (body.uploaded === undefined) ? undefined :{BOOL: body.uploaded },
        'BuildUrl' :  body.buildUrl === undefined ? undefined :{S: body.buildUrl}
      }
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