import { Settings } from '@/scenes/POS/UI/Pos-settings/Types/pos-settings.types';
import {
    GetApiTerminalPaymentLogPaymentId200,
    PostApiMakeCardPayment200,
    PostApiMakeCardPayment400,
    PostApiMakeCardPayment500,
} from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { v4 as uuidv4 } from 'uuid';

// Types for payment terminal integration
export interface PaymentRequest {
    amounts: {
        currencySymbol: string;
        base: number;
    };
}

export interface PaymentResponse {
    success: boolean;
    data?: any;
    error?: string;
    statusCode?: number;
    serverAuthorization?: string;
}

export interface TerminalConfig {
    terminalIp: string;
    terminalPort: number;
}

// Crypto hash generation functions (adapted for browser environment)
// function makeAuthorizationHeader(timestamp: string, hash: string): string {
//     return `Samport-Keyed-Hash-v1 ${timestamp} ${hash}`;
// }

// function generateRequestHash(
//     secretKey: string,
//     timestamp: string,
//     httpMethod: string,
//     httpPath: string,
//     httpContent: string,
// ): string {
//     const hashInput = `${secretKey}\n${timestamp}\n${httpMethod}\n${httpPath}\n${httpContent}\n${secretKey}`;
//     return generateSHA256Hash(hashInput);
// }

// // Browser-compatible SHA256 hash generation using crypto-js
// function generateSHA256Hash(input: string): string {
//     return CryptoJS.SHA256(input).toString(CryptoJS.enc.Base64);
// }

// Function to check if payment was actually successful
// function checkPaymentSuccess(responseData: any): boolean {
//     if (!responseData) {
//         return false;
//     }

//     // Check for specific terminal response fields first
//     const transactionOutcome = responseData.transactionOutcome || responseData.TransactionOutcome;
//     const outcomeDescription = responseData.outcomeDescription || responseData.OutcomeDescription;

//     // Check for common cancellation indicators
//     const status = responseData.status || responseData.Status || responseData.state || responseData.State;
//     const result = responseData.result || responseData.Result || responseData.outcome || responseData.Outcome;
//     const message =
//         responseData.message || responseData.Message || responseData.description || responseData.Description;

//     // Common success indicators
//     const successIndicators = ['SUCCESS', 'APPROVED', 'COMPLETED', 'OK', 'SUCCESSFUL'];
//     const cancellationIndicators = ['CANCELLED', 'CANCELED', 'ABORTED', 'DECLINED', 'REJECTED', 'FAILED', 'ERROR'];

//     // Check transactionOutcome field (specific to this terminal)
//     if (transactionOutcome) {
//         const outcomeUpper = transactionOutcome.toString().toUpperCase();
//         if (cancellationIndicators.includes(outcomeUpper)) {
//             return false;
//         }
//         if (successIndicators.includes(outcomeUpper)) {
//             return true;
//         }
//     }

//     // Check outcomeDescription field (specific to this terminal)
//     if (outcomeDescription) {
//         const descriptionUpper = outcomeDescription.toString().toUpperCase();
//         if (
//             descriptionUpper.includes('USERCANCEL') ||
//             descriptionUpper.includes('USER_CANCEL') ||
//             descriptionUpper.includes('CANCELLED') ||
//             descriptionUpper.includes('CANCELED') ||
//             descriptionUpper.includes('ABORTED') ||
//             descriptionUpper.includes('DECLINED') ||
//             descriptionUpper.includes('REJECTED') ||
//             descriptionUpper.includes('FAILED') ||
//             descriptionUpper.includes('ERROR')
//         ) {
//             return false;
//         }
//     }

//     // Check status field
//     if (status) {
//         const statusUpper = status.toString().toUpperCase();
//         if (cancellationIndicators.includes(statusUpper)) {
//             return false;
//         }
//         if (successIndicators.includes(statusUpper)) {
//             return true;
//         }
//     }

//     // Check result field
//     if (result) {
//         const resultUpper = result.toString().toUpperCase();
//         if (cancellationIndicators.includes(resultUpper)) {
//             return false;
//         }
//         if (successIndicators.includes(resultUpper)) {
//             return true;
//         }
//     }

//     // Check message field for cancellation keywords
//     if (message) {
//         const messageUpper = message.toString().toUpperCase();
//         if (
//             messageUpper.includes('CANCELLED') ||
//             messageUpper.includes('CANCELED') ||
//             messageUpper.includes('ABORTED') ||
//             messageUpper.includes('DECLINED') ||
//             messageUpper.includes('REJECTED') ||
//             messageUpper.includes('FAILED') ||
//             messageUpper.includes('ERROR')
//         ) {
//             return false;
//         }
//     }

//     // If we can't determine from the response, assume success for 2xx status codes
//     // but log the response for debugging
//     return true;
// }

// Get terminal configuration from settings
export function getTerminalConfig(settings: Settings): TerminalConfig | null {
    const terminalConfig = settings.terminalConfiguration;

    if (!terminalConfig.terminalIp || !terminalConfig.terminalPort) {
        console.warn('Terminal configuration is incomplete');
        return null;
    }

    return {
        terminalIp: terminalConfig.terminalIp,
        terminalPort: terminalConfig.terminalPort,
    };
}

// Main payment function
export async function processCardPayment(
    amount: number,
    currency: string = 'DKK',
    settings: Settings,
): Promise<PostApiMakeCardPayment200 | PostApiMakeCardPayment400 | PostApiMakeCardPayment500> {
    const terminalConfig = getTerminalConfig(settings);
    if (!terminalConfig) {
        return {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Terminal configuration is incomplete. Please check your POS settings.',
        };
    }

    const uuid = uuidv4();

    try {
        const response = await api.postApiMakeCardPayment({
            amount: amount * 100,
            paymentId: uuid,
            currency: currency,
            paymentMethod: 'CARD',
        });

        switch (response.data?.status) {
            case 'SUCCESS':
                return response as PostApiMakeCardPayment200;
            case 'FAILED':
                return response as PostApiMakeCardPayment400;
            case 'INITIATED':
                return response as PostApiMakeCardPayment200;
            case 'CANCELLED':
                return response as PostApiMakeCardPayment200;
            default:
                return response as PostApiMakeCardPayment200;
        }
    } catch (error: any) {
        return {
            error: error,
            message: error,
            statusCode: error,
        };
    }
}

// Check payment status
export async function checkTerminalPaymentStatus(
    paymentId: string,
): Promise<GetApiTerminalPaymentLogPaymentId200 | null> {
    try {
        const response = await api.getApiTerminalPaymentLogPaymentId(paymentId);
        return response;
    } catch (error) {
        console.error('Error checking payment status', error);
        return null;
    }
}

// Utility function to validate terminal configuration
export function validateTerminalConfig(settings: Settings): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const terminalConfig = settings.terminalConfiguration;

    if (!terminalConfig.terminalIp || terminalConfig.terminalIp.trim() === '') {
        errors.push('Terminal IP is required');
    }

    if (!terminalConfig.terminalPort || terminalConfig.terminalPort <= 0) {
        errors.push('Valid terminal port is required');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Function to test terminal connection
// export async function testTerminalConnection(settings: Settings): Promise<{ success: boolean; message: string }> {
//     const terminalConfig = getTerminalConfig(settings);

//     if (!terminalConfig) {
//         return {
//             success: false,
//             message: 'Terminal configuration is incomplete',
//         };
//     }

//     try {
//         // Try to make a simple request to test connection using proxy
//         const response = await fetch(
//             '/api/v2/Status', // Use proxy path instead of direct IP
//             {
//                 method: 'GET',
//                 headers: {
//                     'Integration-Key': terminalConfig.integrationKey,
//                     'Content-Type': 'application/json',
//                 },
//             },
//         );

//         if (response.ok) {
//             return {
//                 success: true,
//                 message: 'Terminal connection successful',
//             };
//         } else {
//             return {
//                 success: false,
//                 message: `Terminal responded with status ${response.status}`,
//             };
//         }
//     } catch (error: any) {
//         return {
//             success: false,
//             message: `Connection failed: ${error.message}`,
//         };
//     }
// }
