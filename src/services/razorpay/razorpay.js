import RazorpayCheckout from 'react-native-razorpay';
import { COLORS } from '../../constants';

/**
 * Initiates a Razorpay payment
 *
 * @param {Object} params
 * @param {Object} params.user - { name: string, email: string, contact: string }
 * @param {number} params.amount - Amount in rupees (e.g., 499)
 * @param {string} [params.description] - Payment purpose
 * @param {string} [params.image] - Merchant logo URL
 * @param {Object} [params.notes] - Optional additional notes
 *
 * @returns {Promise<{ success: boolean, paymentId?: string, error?: any }>}
 */

export const initiatePayment = async ({
    user,
    amount,
    description = 'Payment',
    image = '',
    notes = {},
}) => {
    const options = {
        key: 'rzp_test_rbtiJwMEVvjiw6', // your Razorpay key
        name: 'Deepak',
        description,
        image,
        currency: 'INR',
        amount: amount * 100,
        prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.number || '',
        },
        notes,
        theme: { color: COLORS.primary || '#3399cc' },
    };

    try {
        const data = await RazorpayCheckout.open(options);

        if (data?.razorpay_payment_id) {
            return {
                success: true,
                paymentId: data.razorpay_payment_id,
            };
        }

        return {
            success: false,
            error: 'Payment was closed or failed without payment ID',
        };
    } catch (error) {
        return {
            success: false,
            error,
        };
    }
};
