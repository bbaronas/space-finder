import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpace } from "./UpdateSpace";
import { deleteSpace } from "./DeleteSpace";
import { JSONError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { captureAWSv3Client, getSegment } from 'aws-xray-sdk-core';

const ddbClient = captureAWSv3Client(new DynamoDBClient({}));

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  let response: APIGatewayProxyResult;

  // Example of wrapping an X-Ray sub segment around code for tracing purposes
  // const subSeg = getSegment().addNewSubsegment('ExampleLongCall')
  // await new Promise(resolve => {setTimeout(resolve, 3000)});
  // subSeg.close();

  try {
    switch (event.httpMethod) {
      case 'GET':
        const getResponse = await getSpaces(event, ddbClient);
        response = getResponse;
        break;

      case 'POST':
        const postResponse = await postSpaces(event, ddbClient);
        response = postResponse;
        break;

      case 'PUT':
        const updateResponse = await updateSpace(event, ddbClient);
        response = updateResponse;
        break;

      case 'DELETE':
        const deleteResponse = await deleteSpace(event, ddbClient);
        response = deleteResponse;
        break;

      default:
        break;
    }
  } catch (error) {

    if (error instanceof MissingFieldError) {
      return {
        statusCode: 400,
        body: JSON.stringify((error as Error).message),
      }
    }

    if (error instanceof JSONError) {
      return {
        statusCode: 400,
        body: JSON.stringify((error as Error).message),
      }
    }

    return {
        statusCode: 500,
        body: JSON.stringify((error as Error).message),
      };
  }

  addCorsHeader(response);
  return response;
}

export { handler };
