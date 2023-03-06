data "archive_file" "get-build" {
  type = "zip"
  source_dir = "${path.module}\\lambdas\\get-build-details\\"
  output_path = "${path.module}\\build-manager-get-build-details.zip"
}

resource "aws_apigatewayv2_integration" "get-build" {
  api_id = aws_apigatewayv2_api.build-manager.id

  integration_type = "AWS_PROXY"
  integration_method = "POST"
  integration_uri = aws_lambda_function.build-manager-get-build.invoke_arn
}

resource "aws_lambda_permission" "get-build" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.build-manager-get-build.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.build-manager.execution_arn}/*/*"
}

resource "aws_lambda_function" "build-manager-get-build" {
  function_name = "build-manager-get-build"
  role          = aws_iam_role.role_for_lambdas.arn
  filename = data.archive_file.get-build.output_path
  handler = "get-build-details.handler"

  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  source_code_hash = data.archive_file.get-build.output_base64sha256

  runtime = "nodejs16.x"

  depends_on = [
    data.archive_file.get-build
  ]
}

resource "aws_apigatewayv2_route" "get-build" {
  api_id = aws_apigatewayv2_api.build-manager.id
  route_key = "POST /build/{buildId}"
  target = "integrations/${aws_apigatewayv2_integration.get-build.id}"
}
