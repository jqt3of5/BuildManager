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
resource "aws_apigatewayv2_deployment" "build-manager-deployment" {
	api_id      = aws_apigatewayv2_api.build-manager.id
	description = "A Deployment"

	lifecycle {
		create_before_destroy = true
	}
}
resource "aws_apigatewayv2_integration" "build-manager-integration" {
	api_id = aws_apigatewayv2_api.build-manager.id
	integration_type = "HTTP_PROXY"

	integration_method = "ANY"
	integration_uri = "https://google.com/{proxy}"
}

resource "aws_apigatewayv2_route" "build-manager-route" {
	api_id = aws_apigatewayv2_api.build-manager.id
	route_key = "ANY /example/{proxy+}"

	target = "integrations/${aws_apigatewayv2_integration.build-manager-integration.id}"
}

resource "aws_dynamodb_table" "build-manager-metadata-table" {
	name = "BuildMetadata"
	billing_mode = "PROVISIONED"
	read_capacity = 20
	write_capacity = 20
	hash_key = "CommitHash"

	attribute {
		name = "CommitHash"
		type = "S"
	}
	attribute {
		name = "Branch"
		type = "S"
	}
	attribute {
		name = "BuildConfiguration"
		type = "S"
	}
	attribute {
		name = "BuildNumber"
		type = "N"
	}
}


