# JupiterOne Repository Relationship Generator

A script that generates JupiterOne entity relationships between a repository and its dependencies.
This script will look for dependencies within a repository's `package.json` file as well as the `dependencies.yaml`file if the repository has a `deploy` directory.

## Before Running
- Create a directory containing the repositories that you would like the script to be run on (Note: You will need the path to this directory while running the script).

- Ensure that the `package.json` for each repository is at the root of the repository.

- JupiterOne API credentials are required to run the necessary queries to create the relationships.
  - You must pass in your account and access token.
  - You will be prompted for both of these when you run the script.
  - You have the option to create env variables to bypass manually entering them into the console.

## Running the script

- Use `yarn create-relationships`
- If you wish to only run the script on a certain group of dependencies, you have the option of inputting any number of package scopes.
  - Example:
    - Dependencies list:
      - `@jupiterone/jupiterone-client-nodejs`
      - `@lifeomic/alpha`
      - `@lifeomic/base-pipeline`
      - `graphlql`
      - `dotenv`
    ```
    Input a package scope, i.e. @package (input QUIT when finished): @lifeomic
    Input a package scope, i.e. @package (input QUIT when finished): @jupiterone
    Input a package scope, i.e. @package (input QUIT when finished): QUIT
    ```
    This set of inputs will create relationships for the first three items on the dependencies list above.

- Example Output:
  ```
  Could not query Repo (advent-helix-vcf-ingest).
  Could not query Repo (app-store-admin-web).
  Could not query Repo (app-store-service).
  
  Repo: analytics-api
  Successfully created relationship (analytics-api USES @lifeomic/koa: ^6.10.0).
  Successfully created relationship (analytics-api USES @lifeomic/lambda-runtime-tools: ^1.3.1).
  Successfully created relationship (analytics-api USES @lifeomic/logging: ^1.0.2).
  Successfully created relationship (analytics-api USES @lifeomic/project-client: ^2.0.0).
  Successfully created relationship (analytics-api DEPENDS_ON lambda-cloudwatch-slack).
  Successfully created relationship (analytics-api DEPENDS_ON provision-environment).
  Successfully created relationship (analytics-api DEPENDS_ON provision-api-gateway).
  Successfully created relationship (analytics-api DEPENDS_ON provision-pager-duty).
  Successfully created relationship (analytics-api DEPENDS_ON sumo-cloudwatch-logs).
  Failed to create relationship with variant-ml (was not found on the graph). Skipped.
  Successfully created relationship (analytics-api DEPENDS_ON track-usage).
  Successfully created relationship (analytics-api DEPENDS_ON analytics-listener).

  Summary:
  Created Relationships: 11
  Failed Attempts: 1
  Failed dependencies:
    variant-ml (analytics-api, deploy).
  ```

