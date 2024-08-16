import { SNSEvent } from "aws-lambda";
import { handler } from "../src/services/monitor/handler";



const snsEvent: SNSEvent = {
    Records: [{
        Sns: {
            Message: 'This is a Test'
        }
    }]
} as any;

handler(snsEvent, {});
