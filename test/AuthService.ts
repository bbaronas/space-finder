import { Amplify } from 'aws-amplify'
import { SignInOutput, fetchAuthSession, signIn} from "@aws-amplify/auth";
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const awsRegion = 'us-east-1';

Amplify.configure({
    Auth: {
        Cognito: {
        userPoolId: 'us-east-1_K9RhIfgNj',
        userPoolClientId: '3mvr2fsbntvko6a267berritqo',
        }
    }
});

export class AuthService {

    public async login(username: string, password: string) {
        const signInOutput: SignInOutput = await signIn({
            username,
            password,
            options: {
                authFlowType: 'USER_PASSWORD_AUTH'
            }
        });
        return signInOutput;
    }

    public async getIdToken() {
        const authSession = await fetchAuthSession();
        return authSession.tokens?.idToken?.toString();
    }

    // public async generateTemporaryCrebentials(user: CognitoUser) {
    //     const jwtToken = user.getSignInUserSession()!.getIdToken().getJwtToken();
    //     const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/us-east-1_K9RhIfgNj`;
    //     const cognitoIdentity = new CognitoIdentityClient({
    //         credentials: fromCognitoIdentityPool({
    //             identityPoolId: 'us-east-1:0a536154-40f5-4ed9-b46a-c3eecf5cd806',
    //             logins: {
    //                 [cognitoIdentityPool]: jwtToken
    //             }
    //         })
    //     });
    //     const credentials = await cognitoIdentity.config.credentials();
    //     return credentials;
    // }
}
