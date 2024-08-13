import { type CognitoUser } from '@aws-amplify/auth';
import { Amplify, Auth } from 'aws-amplify';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'us-east-1';

Amplify.configure({
    Auth: {
        region: awsRegion,
        userPoolId: 'us-east-1_Cp5SAX7Ff',
        userPoolWebClientId: '498b5t6v0fh40j1ihm4lrjpip',
        identityPoolId: 'us-east-1:eafa3e67-5cbf-4e90-b42d-b92b994f97c9',
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
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-east-1_Cp5SAX7Ff`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                identityPoolId: 'us-east-1:eafa3e67-5cbf-4e90-b42d-b92b994f97c9',
                logins: {
                    [cognitoIdentityPool]: jwtToken
                }
            })
        });
        const credentials = await cognitoIdentity.config.credentials();
        return credentials;
    }
}
