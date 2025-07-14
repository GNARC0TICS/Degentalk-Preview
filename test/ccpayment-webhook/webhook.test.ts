import { expect } from 'chai';
import sinon from 'sinon';
import { CCPaymentWebhookController } from '@/domains/wallet/webhooks/ccpayment-webhook.controller';
import { ccpaymentWebhookService } from '@/domains/wallet/webhooks/ccpayment-webhook.service';
import { getMockReq, getMockRes } from '@jest-mock/express';

describe('CCPaymentWebhookController', () => {
	let controller: CCPaymentWebhookController;
	let processWebhookStub: sinon.SinonStub;

	beforeEach(() => {
		controller = new CCPaymentWebhookController();
		// Stub the service method that the controller will call
		processWebhookStub = sinon.stub(ccpaymentWebhookService, 'processWebhook');
	});

	afterEach(() => {
		sinon.restore();
	});

	it('should immediately send a 200 OK response and process the webhook in the background', async () => {
		const mockReq = getMockReq({
			headers: {
				Appid: 'test-app-id',
				Sign: 'test-signature',
				Timestamp: '1234567890',
			},
			// Simulate the raw body attached by middleware
		awBody: Buffer.from(JSON.stringify({ type: 'UserDeposit', msg: { recordId: 'test-record' } })),
		});
		const { res: mockRes, next: mockNext } = getMockRes();

		processWebhookStub.resolves({ success: true, message: 'Processed' });

		await controller.handleWebhook(mockReq, mockRes);

		// 1. Check that we immediately sent a success response
		expect(mockRes.status).to.have.been.calledWith(200);
		expect(mockRes.json).to.have.been.calledWith(sinon.match({ message: 'Webhook received' }));

		// 2. Use a small timeout to allow the async processing to be called
		await new Promise(resolve => setTimeout(resolve, 10));

		// 3. Check that the service method was called correctly in the background
		expect(processWebhookStub.calledOnce).to.be.true;
		expect(processWebhookStub).to.have.been.calledWith(
			JSON.stringify({ type: 'UserDeposit', msg: { recordId: 'test-record' } }),
			sinon.match({ appid: 'test-app-id', sign: 'test-signature' })
		);
	});

	it('should handle requests where the raw body is missing', async () => {
		const mockReq = getMockReq({
			headers: {
				Appid: 'test-app-id',
				Sign: 'test-signature',
				Timestamp: '1234567890',
			},
			// No rawBody
		});
		const { res: mockRes, next: mockNext } = getMockRes();

		await controller.handleWebhook(mockReq, mockRes);

		expect(mockRes.status).to.have.been.calledWith(200);
		expect(mockRes.send).to.have.been.calledWith('Error: Missing raw body');
		// Ensure we did NOT attempt to process the webhook
		expect(processWebhookStub.called).to.be.false;
	});
});
