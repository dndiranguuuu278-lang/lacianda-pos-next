import { getMpesaConfig, type MpesaConfig } from './mpesaConfig';

// Helper to generate random codes for request IDs
export function randomCode(prefix: string, length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Initiates the STK Push request
export async function initiateStkPush(params: { phone: string; amount: number; accountRef?: string; description?: string }) {
  const checkoutRequestId = randomCode('ws_', 10);
  const merchantRequestId = randomCode('mr_', 10);
  
  // Simulated delay to mimic Safaricom M-Pesa prompt behavior
  await delay(1800 + Math.random() * 1400);

  const succeeds = Math.random() < 0.85; // 85% success rate simulation
  if (!succeeds) {
    return {
      success: false,
      simulated: true,
      checkoutRequestId,
      CheckoutRequestID: checkoutRequestId,
      MerchantRequestID: merchantRequestId,
      message: 'Simulated payment failed - customer cancelled or PIN timeout.',
    };
  }

  return {
    success: true,
    simulated: true,
    checkoutRequestId,
    CheckoutRequestID: checkoutRequestId,
    MerchantRequestID: merchantRequestId,
    message: 'Success. Request accepted for processing',
  };
}

export const stkPush = initiateStkPush;

// 2. Parses the incoming M-Pesa STK callback webhook response
export function parseStkCallback(callbackData: any) {
  const body = callbackData?.Body?.stkCallback;
  if (!body) {
    return { 
      success: false, 
      resultCode: -1, 
      resultDesc: 'Invalid callback structure', 
      checkoutRequestId: '',
      checkoutRequestID: '' 
    };
  }

  const reqId = body.CheckoutRequestID || '';

  return {
    resultCode: body.ResultCode,
    resultDesc: body.ResultDesc,
    checkoutRequestId: reqId,
    checkoutRequestID: reqId,
    success: body.ResultCode === 0,
    amount: body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount')?.Value || 0,
    mpesaReceiptNumber: body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value || '',
    phoneNumber: body.CallbackMetadata?.Item?.find((i: any) => i.Name === 'PhoneNumber')?.Value || '',
  };
}
