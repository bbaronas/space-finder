import { Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, MethodLoggingLevel, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
    spacesLambdaIntegration: LambdaIntegration;
    userPool: IUserPool
}


export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, 'SpacesApi', {
            deployOptions: {
                loggingLevel: MethodLoggingLevel.ERROR,
                tracingEnabled: true,
            }
        });

        const authorizer = new CognitoUserPoolsAuthorizer(this, 'SpaceApiAuthorizer', {
            cognitoUserPools: [props.userPool],
            identitySource: 'method.request.header.Authorization'
        })

        authorizer._attachToApi(api);

        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            },
        }

        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            }
        }

        const spaceResource = api.root.addResource('spaces', optionsWithCors);
        spaceResource.addMethod('GET', props.spacesLambdaIntegration, optionsWithAuth);
        spaceResource.addMethod('POST', props.spacesLambdaIntegration, optionsWithAuth);
        spaceResource.addMethod('PUT', props.spacesLambdaIntegration, optionsWithAuth);
        spaceResource.addMethod('DELETE', props.spacesLambdaIntegration, optionsWithAuth);
    }
}
