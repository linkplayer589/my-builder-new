import type { Stripe } from 'stripe';

export type StripeTransactionFeeDetail = {
    amount: number;
    currency: string;
    type: string;
    description: string | null;
};

export type StripeTransactionBalanceDetail = {
    id: string;
    amount: number;
    fee: number;
    net: number;
    type: Stripe.BalanceTransaction.Type;
    feeDetails: StripeTransactionFeeDetail[];
};

export type StripeTransactionRefund = {
    id: string;
    amount: number;
    currency: string;
    status: string | null;
    reason: Stripe.Refund.Reason | null;
    created: string;
};

export type StripeTransactionCharge = {
    id: string;
    amount: number;
    currency: string;
    status: Stripe.Charge.Status;
    created: string;
    paid: boolean;
    refunded: boolean;
    captured: boolean;
    failureCode: string | null;
    failureMessage: string | null;
    receiptUrl: string | null;
    disputed: boolean;
    balanceTransaction: StripeTransactionBalanceDetail | null;
    refunds: StripeTransactionRefund[];
};


export type StripeTransactionDetails = {
    paymentIntent: Stripe.PaymentIntent;
    customer: Stripe.Customer | null;
    paymentMethod: Stripe.PaymentMethod | null;
    charges: StripeTransactionCharge[];
    review: Stripe.Review | null;
    updatedAt: string;
};

/**
 * Stripe Invoice Line Item structure
 */
export type StripeInvoiceLineItem = {
    amount: number;
    quantity: number;
    description: string | null;
    [key: string]: unknown;
};

/**
 * Stripe Invoice structure from API
 */
export type StripeInvoice = {
    id: string;
    status: string;
    amount_due: number;
    amount_paid: number;
    amount_remaining: number;
    total: number;
    currency: string;
    number: string | null;
    hosted_invoice_url?: string;
    customer_email?: string;
    lines: {
        data: StripeInvoiceLineItem[];
    };
    status_transitions?: Record<string, unknown>;
    [key: string]: unknown;
};

/**
 * Stripe Invoice Data wrapper
 */
export type StripeInvoiceData = {
    updatedAt: string;
    invoices: StripeInvoice[];
};
