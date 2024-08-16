import { App } from "aws-cdk-lib";
import { MonitorStack } from "../../src/infra/stacks/MonitorStack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";


describe('Initial Test Suite', () => {

    let monitorStackTemplate: Template;

    beforeAll(() => {
        const testApp = new App({
            outdir: 'cdk.out',
        });
        const monitorStack = new MonitorStack(testApp, 'MonitorStack');
        monitorStackTemplate = Template.fromStack(monitorStack);
    })

    test('Lambda Properties', () => {

        monitorStackTemplate.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs20.x',
        });
    });

    test('SNS Topic Properties', () => {

        monitorStackTemplate.hasResourceProperties('AWS::SNS::Topic', {
            DisplayName: 'AlarmTopic',
            TopicName: 'AlarmTopic',
        });
    });

    test('SNS Subscription Properties - with matchers', () => {

        monitorStackTemplate.hasResourceProperties('AWS::SNS::Subscription',
        Match.objectEquals(
        {
            Protocol: 'lambda',
            TopicArn: {
                Ref: Match.stringLikeRegexp('AlarmTopic')
            },
            Endpoint: {
                'Fn::GetAtt': [
                    Match.stringLikeRegexp('WebHookLambda'),
                    'Arn'
                ]
            }
        }));
    });

    test('SNS Subscription Properties - with exact values', () => {

        const snsTopic = monitorStackTemplate.findResources('AWS::SNS::Topic');
        const snsTopicName = Object.keys(snsTopic)[0];

        const lambda = monitorStackTemplate.findResources('AWS::Lambda::Function');
        const lambdaName = Object.keys(lambda)[0];

        monitorStackTemplate.hasResourceProperties('AWS::SNS::Subscription',
        {
            Protocol: 'lambda',
            TopicArn: {
                Ref: snsTopicName,
            },
            Endpoint: {
                'Fn::GetAtt': [
                    lambdaName,
                    'Arn',
                ]
            }
        });
    });

    test('Alarm Actions', () => {
        const alarmActinsCapture = new Capture();
        monitorStackTemplate.hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmActions: alarmActinsCapture
        });

        expect(alarmActinsCapture.asArray()).toEqual([{
            Ref: expect.stringMatching(/^AlarmTopic/)
        }])
    });

    test('MonitorStack Snapshot Test', () => {
        expect(monitorStackTemplate.toJSON()).toMatchSnapshot();
    });

    test('Lambda Snapshot Test', () => {
        const lambda = monitorStackTemplate.findResources('AWS::Lambda::Function');
        expect(lambda).toMatchSnapshot();
    });

    test('SNS Topic Snapshot Test', () => {
        const snsTopic = monitorStackTemplate.findResources('AWS::SNS::Topic');
        expect(snsTopic).toMatchSnapshot();
    });
});
