import type { JSONValue } from "hono/utils/types";

export type Env = {
    DATABASE_URL: string
    MYTH_API_KEY: string
    SKIDATA_USER: string
    SKIDATA_PASSWORD: string
    SKIDATA_BASEURL: string
    SKIDATA_SALES_CHANNEL_SHORT_NAME: string
    SKIDATA_POINT_OF_SALE_NAME: string
    DEEPL_API_KEY: string
    TWILIO_ACCOUNT_SID: string
    TWILIO_AUTH_TOKEN: string
    TWILIO_MSID: string
    TWILIO_ACCOUNT_SID_DEFAULT: string
    TWILIO_AUTH_TOKEN_DEFAULT: string
    TWILIO_ACCOUNT_SID_TEST: string
    TWILIO_AUTH_TOKEN_TEST: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
};

export type ResortConfig = {
    DEFAULT_CURRENCY: string
    AVAILABLE_LANGUAGES: string[]
}

export interface SessionError {
    status: number;
    message: string;
    body?: JSONValue;
    metaData?: JSONValue;
    timestamp: string;
}

export interface SessionLog {
    sessionId: string;
    createdAt: string;
    lastActivityAt: string;
    status: string;
    actions: Action[];
    [key: string]: unknown;
}

export interface Action {
    timestamp: string;
    type: string;
    description?: string;
    [key: string]: unknown;
}