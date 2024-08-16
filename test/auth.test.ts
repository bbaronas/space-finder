import { AuthService } from "./AuthService";
import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";


async function testAuth() {
    const service = new AuthService();
    const loginResult = await service.login(
        'barry.b',
        'fym5bfa1bxn_bmk_VAX'
    );
    // console.log(loginResult);
    const idToken = await service.getIdToken();
    console.log(idToken);
    const buckets = await listBuckets(idToken);
    // console.log(buckets);
}

async function listBuckets(credentials: any) {
    const client = new S3Client({
        credentials
    });
    const command = new ListBucketsCommand({});
    const result = await client.send(command);
    return result;
}

testAuth();
