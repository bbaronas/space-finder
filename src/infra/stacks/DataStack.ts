import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';
import { BlockPublicAccess, Bucket, ObjectOwnership, BucketAccessControl, HttpMethods, IBucket } from 'aws-cdk-lib/aws-s3';
import { AllowedMethods } from 'aws-cdk-lib/aws-cloudfront';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';


export class DataStack extends Stack {
    public readonly spacesTable: ITable
    public readonly photosBucket: IBucket

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        this.photosBucket = new Bucket(this, 'SpaceFinderPhotos', {
            bucketName: `space-finder-photos-${suffix}`,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT
                ],
                allowedOrigins: ['*'],
                allowedHeaders: ['*']
            }],
            objectOwnership: ObjectOwnership.OBJECT_WRITER,
            // accessControl: BucketAccessControl.PUBLIC_READ,
            // publicReadAccess: true,
            blockPublicAccess: {
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false
            }
        });

        // this.photosBucket.addToResourcePolicy(
        //     new PolicyStatement({
        //         effect: Effect.ALLOW,
        //         actions: ['s3:GetObject'],
        //         resources: [this.photosBucket.arnForObjects('*')],
        //         principals: [new AnyPrincipal()]
        //     })
        // )

        new CfnOutput(this, 'SpaceFinderPhotosBucketName', {
            value: this.photosBucket.bucketName
        })

        this.spacesTable = new Table(this, 'SpacesTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: `SpacesTable-${suffix}`
        })
    }
}
