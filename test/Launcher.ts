import { handler } from "../src/services/spaces/handler";



handler({
    httpMethod: 'POST',
    body: JSON.stringify({
        location: 'mar-a-lago'
    })
} as any, {} as any).then(result => {
    console.log(result);
});
