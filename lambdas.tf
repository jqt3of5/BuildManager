data "archive_file" "get-builds" {
  type = "zip"
  source_file = "${path.module}\\lambdas\\get-builds.js"
  output_path = "${path.module}\\build-manager-get-builds.zip"
}