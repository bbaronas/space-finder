import { CfnOutput, Stack, StackProps } from "aws-cdk-lib"
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../Utils";
import { join } from "path";
import { existsSync } from "fs";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { CfnDistribution, CfnOriginAccessControl, Distribution, OriginAccessIdentity, SecurityPolicyProtocol, SSLMethod, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";


export class UiDeploymentStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        const deploymentBucket = new Bucket(this, 'UiDeploymentBucket', {
            bucketName: `space-finder-frontend-${suffix}`
        });

        const uiDir = join(__dirname, '..', '..', '..', '..', 'space-finder-frontend', 'dist');
        if (!existsSync(uiDir)) {
            console.warn('UI Directory not found. Build the frontend app before deploying it.' + uiDir)
            return;
        }

        new BucketDeployment(this, 'SpacesFinderDeployment', {
            destinationBucket: deploymentBucket,
            sources: [Source.asset(uiDir)]
        });

        // const originAccessControl = new CfnOriginAccessControl(this, 'OriginAccessControl', {
        //     originAccessControlConfig: {
        //         name: `origin-access-control`,
        //         originAccessControlOriginType: 's3',
        //         signingBehavior: 'always',
        //         signingProtocol: 'sigv4',
        //     }
        // });

        const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        deploymentBucket.grantRead(originIdentity);

        const distribution = new Distribution(this, 'SpaceFinderDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(deploymentBucket, { originAccessIdentity: originIdentity }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            domainNames: ['testing.bithoop.com'],
            certificate: Certificate.fromCertificateArn(this, 'TestingCertificate', 'arn:aws:acm:us-east-1:630323321831:certificate/a54bb849-ec8b-4085-a1ed-8448eff8f751'),
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            sslSupportMethod: SSLMethod.SNI
        });
        new CfnOutput(this, 'SpaceFinderUrl', {
            value: distribution.distributionDomainName
        });

        // const oacDistribution = distribution.node.defaultChild as CfnDistribution
        // oacDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', originAccessControl.attrId);
    }

}
