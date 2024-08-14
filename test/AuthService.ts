import { type CognitoUser } from '@aws-amplify/auth';
import { Amplify, Auth } from 'aws-amplify';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'us-east-1';

Amplify.configure({
    Auth: {
        region: awsRegion,
        userPoolId: 'us-east-1_K9RhIfgNj',
        userPoolWebClientId: '3mvr2fsbntvko6a267berritqo',
        identityPoolId: 'us-east-1:0a536154-40f5-4ed9-b46a-c3eecf5cd806',
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
})

export class AuthService {

    public async login(username: string, password: string) {
        const result = await Auth.signIn(username, password) as CognitoUser;
        return result
    }

    public async generateTemporaryCrebentials(user: CognitoUser) {
        const jwtToken = user.getSignInUserSession()!.getIdToken().getJwtToken();
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-east-1_K9RhIfgNj`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                identityPoolId: 'us-east-1:0a536154-40f5-4ed9-b46a-c3eecf5cd806',
                logins: {
                    [cognitoIdentityPool]: jwtToken
                }
            })
        });
        const credentials = await cognitoIdentity.config.credentials();
        return credentials;
    }
}
