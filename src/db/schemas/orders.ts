import { integer, json, pgTable, serial, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type SkidataGetOrderResponse, type SkidataOrderSubmission } from "@/types/skidata-types";
import { type CalculatedOrderPrice, type OrderDetails, type ClientDetails } from '@/types/general-types';
import { clients } from '@/db/schemas/clients';
import { resorts } from '@/db/schemas/resorts';
import { type MythOrderDetails, type MythGetOrderResponse } from '@/types/myth-types';
import { type StripeTransactionDetails } from '@/types/stripe-types';
import { type Stripe } from 'stripe';
// Used to store orders from the Click & Collect system, OTPs, and realted transaction data.

// Used to store orders from the Click & Collect system, OTPs, and realted transaction data.
export const orders = pgTable('orders', {
    id: serial('id').primaryKey().unique().notNull(),
    status: varchar('status', {
        length: 30,
        enum: [

            // Order creation statuses
            'order-created',
            // Order creation statuses
            'intent-payment-pending',
            // Payment processing statuses
            'payment-processing', 'payment-requires-action', 'payment-sent-to-terminal',
            // Payment completion statuses
            'deposit-paid', 'fully-paid',
            // or Payment failure statuses
            'payment-failed', 'payment-cancelled', 'payment-expired',
            // Order submission statuses
            'order-submitting', 'order-active', 'submission-failed',
            // Post-completion statuses
            'order-refunded', 'partially-funded', 'capturable', 'order-complete',
        ],
    }).notNull(),
    /**
     * JSDoc: Primary lifecycle state of the order (not payment-specific).
     * Why: Separates business/order flow from payment flow for clarity and control.
     * How: Track creation, submission, activation, completion, and refund states.
     */
    orderStatus: varchar('order_status', {
        length: 30,
        enum: [
            // Order lifecycle (business-level) states
            'ordered', 'awaiting-collection', 'order-active', 'cancelled', 'cancelled-refunded', 'order-complete'
        ]
    }).notNull(),
    /**
     * JSDoc: Current payment state for the order.
     * Why: Allows granular tracking of payment intent/invoice progress separately from order flow.
     * How: Mirrors payment-related states previously mixed into `status`.
     */
    paymentStatus: varchar('payment_status', {
        length: 30,
        enum: [
            'intent-payment-pending', 'payment-processing', 'payment-requires-action', 'payment-sent-to-terminal',
            'deposit-paid', 'fully-paid', 'payment-failed', 'payment-cancelled', 'payment-expired', 'partially-funded', 'capturable'
        ]
    }).notNull(),
    clientId: integer('client_id').references(() => clients.id),
    clientDetails: json('client_details').$type<ClientDetails>(),
    resortId: integer('resort_id').references(() => resorts.id).notNull(),
    salesChannel: text('sales_channel').notNull(),
    orderDetails: json('order_details').$type<OrderDetails>().notNull(),
    calculatedOrderPrice: json('calculated_order_price').$type<CalculatedOrderPrice>().notNull(),

    stripePaymentIntentIds: text('stripe_payment_intent_ids').array(),
    stripeTransactionDatas: json('stripe_transaction_datas').array().$type<StripeTransactionDetails[]>(),
    /**
     * JSDoc: Associated Stripe Invoice identifier when invoices are used to collect payment.
     * Why: Click & Collect flow now issues invoices and uses PaymentIntents to pay them.
     * How: Store the invoice id for reconciliation and support tasks.
     */
    stripeInvoiceId: text('stripe_invoice_id'),
    stripeInvoiceDatas: json('stripe_invoice_datas').array().$type<{updatedAt: string, invoices: Stripe.Invoice[]}[]>(),

    // skidata
    skidataOrderSubmissionId: text('skidata_order_submission_id'),
    skidataOrderSubmissionData: json('skidata_order_submission_data').$type<SkidataOrderSubmission>(),
    skidataConfirmationNumber: text('skidata_confirmation_number'),
    skidataOrderId: text('skidata_order_id'),
    skidataOrderData: json('skidata_order_data').$type<SkidataGetOrderResponse>(),
    /**
     * JSDoc: History of all SkiData order submissions associated with this order.
     * Why: Orders may have multiple submissions (e.g., swaps) and we must retain all IDs and payloads.
     * How: Arrays store the full history, while the singular fields above mirror the latest submission for compatibility.
     */
    skidataOrderSubmissionIds: text('skidata_order_submission_ids').array(),
    skidataOrderSubmissions: json('skidata_order_submissions').array().$type<SkidataOrderSubmission[]>(),
    skidataOrderDatas: json('skidata_order_datas').array().$type<SkidataGetOrderResponse[]>(),

    // myth
    mythOrderSubmissionId: text('myth_order_submission_id'),
    mythOrderSubmissionData: json('myth_order_submission_data').$type<MythOrderDetails>(),
    mythOrderId: text('myth_order_id'),
    mythOrderData: json('myth_order_data').$type<MythGetOrderResponse>(),
    mailchimpData: json('mailchimp_data'),

    otp: text('otp').$defaultFn(() => Math.floor(10000 + Math.random() * 90000).toString()).notNull(),
    testOrder: boolean('test_order').default(false),
    wasError: boolean('was_error').default(false),
    errors: json('errors'),
    notes: json('notes'),
    sessionIds: integer('session_ids').array(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
    deviceIds: text('device_ids').array()
});
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export const NewOrderSchema = createInsertSchema(orders)
export const OrderSchema = createSelectSchema(orders)