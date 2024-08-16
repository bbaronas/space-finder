import { SNSEvent } from "aws-lambda";

const webHookUrl = 'https://hooks.slack.com/services/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'

async function handler(event: SNSEvent, context) {
    for (const record of event.Records) {
        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                "text": `Something went wrong!: ${record.Sns.Message}`
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    }
}

export { handler };
