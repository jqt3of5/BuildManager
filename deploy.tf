terraform {
	required_providers {
		aws = {
			source = "hashicorp/aws"
			version = "~> 4.0"
		}
	}
}

provider "aws" {
	region = "us-west-2"
}

resource "aws_apigatewayv2_api" "build-manager" {
	name = "build-manager-api"
	protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "build-manager-prod-stage" {
	api_id = aws_apigatewayv2_api.build-manager.id
	name = "prod"
}
resource "aws_apigatewayv2_deployment" "build-manager-deployment2" {
	api_id      = aws_apigatewayv2_api.build-manager.id
	description = "A Deployment"

	lifecycle {
		create_before_destroy = true
	}
}
resource "aws_apigatewayv2_integration" "build-manager-integration" {
	api_id = aws_apigatewayv2_api.build-manager.id
	integration_type = "AWS_PROXY"

	connection_type = "INTERNET"
#	content_handling_strategy = "CONVERT_TO_TEXT"
	integration_method = "POST"
	integration_uri = aws_lambda_function.build-manager-get-builds.invoke_arn
	passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_route" "build-manager-route" {
	api_id = aws_apigatewayv2_api.build-manager.id
	route_key = "ANY /example/{proxy+}"

	target = "integrations/${aws_apigatewayv2_integration.build-manager-integration.id}"
}

resource "aws_dynamodb_table" "build-manager-metadata-table" {
	name = "BuildMetadata"
	billing_mode = "PAY_PER_REQUEST"
	hash_key = "CommitHash"

	attribute {
		name = "CommitHash"
		type = "S"
	}
#	attribute {
#		name = "Branch"
#		type = "S"
#	}
#	attribute {
#		name = "BuildConfiguration"
#		type = "S"
#	}
#	attribute {
#		name = "BuildNumber"
#		type = "N"
#	}
}

resource "aws_s3_bucket" "artifacts-bucket" {
	bucket = "build-manager-artifacts-bucket"
}

resource "aws_iam_role" "role_for_lambdas" {
	name = "build-manager-lambda-role"
	managed_policy_arns = [aws_iam_policy.policy_for_lambdas.arn, "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
	assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "policy_for_lambdas" {
	name = "build-manager-lambda-policy"	
	policy = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Action = [
					"lambda:GetAccountSettings",
				]
				Effect   = "Allow"
				Resource = "*"
			},
		]
	}) 
}

resource "aws_lambda_function" "build-manager-get-builds" {
	function_name = "build-manager-get-builds"
	role          = aws_iam_role.role_for_lambdas.arn
	filename = "build-manager-get-builds.zip"
	handler = "get-builds.handler"

	# The filebase64sha256() function is available in Terraform 0.11.12 and later
	# For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
	# source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
	source_code_hash = filebase64sha256("build-manager-get-builds.zip")
	
	runtime = "nodejs16.x"
}





