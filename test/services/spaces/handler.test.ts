const someItems = [{
    id: {
        S: '123'
    },
    location: {
        S: 'Paris'
    }
}]

jest.mock('@aws-sdk/client-dynamodb', () => {
    return {
        DynamoDBClient: jest.fn().mockImplementation(() => {
            return {
                send: jest.fn().mockImplementation(() => {
                    return {
                        Items: someItems
                    }
                })
            }
        }),
        ScanCommand: jest.fn()
    }
});

jest.mock("aws-xray-sdk-core", () => ({
    ...jest.requireActual("aws-xray-sdk-core"),
    getSegment: jest.fn().mockReturnValue({
      addNewSubsegment: jest.fn().mockReturnValue({
        close: jest.fn(),
      }),
    }),
    captureAWSv3Client: jest.fn().mockImplementation((client) => client),
  }));


import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { captureAWSv3Client, getSegment } from 'aws-xray-sdk-core';
import { handler } from "../../../src/services/spaces/handler";

describe('Spaces handler test suite', () => {

    test('Returns spaces from dynamoDb', async () => {
        const result = await handler({
            httpMethod: 'GET'
        } as any, {} as any);

        expect(result.statusCode).toBe(200);
        const expectedResult = [{
            id: '123',
            location: 'Paris'
        }];
        const parsedResultBody = JSON.parse(result.body);
        expect(parsedResultBody).toEqual(expectedResult);

        expect(captureAWSv3Client).toHaveBeenCalledTimes(1);
        expect(ScanCommand).toHaveBeenCalledTimes(1);
    });


})
