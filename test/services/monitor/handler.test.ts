import { handler } from "../../../src/services/monitor/handler"



describe('Monitor Lambda Tests', () => {

    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy.mockImplementation(() => Promise.resolve({} as any))

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('Makes requests for Records in SNS Events', async () => {
        await handler({
            Records: [{
                Sns: {
                    Message: 'Test Message'
                }
            }]
        } as any, {})

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy).toHaveBeenCalledWith(expect.any(String), {
            method: 'POST',
            body: JSON.stringify({
                "text": `Something went wrong!: Test Message`
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        })
    });

    test('No SNS Reocrds no requests', async () => {
        await handler({
            Records: []
        } as any, {})

        expect(fetchSpy).not.toHaveBeenCalled();
    });
})
