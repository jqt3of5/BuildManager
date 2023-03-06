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
	auto_deploy = true
}
resource "aws_apigatewayv2_deployment" "build-manager-deployment" {
	api_id      = aws_apigatewayv2_api.build-manager.id
	description = "A Deployment"

	lifecycle {
		create_before_destroy = true
	}
}

output "api-url" {
	value = aws_apigatewayv2_stage.build-manager-prod-stage.invoke_url
}

resource "aws_dynamodb_table" "build-manager-metadata-table" {
	name = "BuildMetadata"
	billing_mode = "PAY_PER_REQUEST"
	hash_key = "BuildId"

	attribute {
		name = "BuildId"
		type = "S"
	}
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
					"dynamodb:PutItem",
					"dynamodb:Get*",
					"dynamodb:Scan",
					"dynamodb:Update",
					"s3:GetObject",
					"s3:ListBucket"
				]
				Effect   = "Allow"
				Resource = "*"
			},
		]
	}) 
}







