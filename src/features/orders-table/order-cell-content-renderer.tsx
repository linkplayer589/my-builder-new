import React from "react";
import { type Order } from "@/db/schema"
import { type Row } from "@tanstack/react-table"
import { type ClientDetails, type OrderDetails, type CalculatedOrderPrice } from "@/types/general-types"
import { type MythOrderDetails } from "@/types/myth-types"
import { OrdersTableClientDialog } from "@/features/orders-table/orders-table-features/orders-table-client-dialog"
import { MythDialog } from "@/features/orders-table/orders-table-features/orders-table-myth-dialog"
import { SkidataDialog } from "@/features/skidata/skidata-components/skidata-dialog";
import { RelativeDayBadge } from "@/components/ui/relative-day-badge";
import { OrdersTablePriceDialog } from "@/features/orders-table/orders-table-features/orders-table-price-dialog"
import { ClickAndCollectButton } from "@/features/order-collect/order-collect-components/order-collect-button"
import { Badge } from "@/components/ui/badge";
import { StripeDialog } from "@/features/stripe/stripe-components/stripe-dialog";
import { getMythButtonStatus } from "./orders-table-utils/get-myth-button-status"

interface RenderValueProps {
  keyName: string;
  value: unknown;
  row: Row<Order>;
}
    const LABELS: Record<string, string> = {
        clientDetails: "Client Details",
        mythOrderSubmissionData: "Myth Order Submission",
        skidataOrderSubmissionData: "Skidata Order Submission",
        orderDetails: "Order Details",
        calculatedOrderPrice: "Calculated Order Price",
        salesChannel: "Sales Channel",
        testOrder: "Test Order",
        stripePaymentIntentId: "Stripe Payment Intent",
        id: "Order ID",
        orderStatus: "Order Status",
        paymentStatus: "Payment Status",
        createdAt: "Created At",
    };

    function getLabel(key: string): string {
        // Check if the key exists in LABELS
        if (LABELS[key]) return LABELS[key];
        // Fallback: Capitalize and split camelCase as a last resort
        return key
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (str: string) => str.toUpperCase());
    }
function ClientDetails({ value }: { value: ClientDetails }) {
  return (
    <div className="flex flex-col items-start justify-center">
      <strong className="mb-2 ml-1">{getLabel("clientDetails")}:</strong>
      <OrdersTableClientDialog clientDetails={value} />
    </div>
  );
}

function MythOrderSubmissionData({ value, row }: { value: MythOrderDetails; row: Row<Order> }) {
  return (
    <div className="flex w-full flex-row items-center justify-between overflow-hidden">
      <strong>{(getLabel("mythOrderSubmissionData") ?? "").replace(/ Submission$/, "")}:</strong>
      <MythDialog
        mythOrderSubmissionData={value}
        buttonStatus={getMythButtonStatus(row.original)}
      />
    </div>
  );
}

function SkidataOrderSubmissionData({ row }: { row: Row<Order> }) {
  const data = row.original.skidataOrderSubmissionData;
  const resortId = row.original.resortId;
  const orderId = row.original.id;
  if (!data) return null;

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <strong>{getLabel("skidataOrderSubmissionData")}:</strong>
      <SkidataDialog skidataOrderSubmissionData={data} resortId={resortId} orderId={orderId} />
    </div>
  );
}

function OrderDetails({ value }: { value: OrderDetails }) {
  if (typeof value === "object" && value !== null && "startDate" in value) {
    const orderDetailsValue = value as OrderDetails & { startDate?: string | Date | null }
    const startDate = orderDetailsValue.startDate ? new Date(orderDetailsValue.startDate) : null;
    return (
      <div className="flex flex-row gap-1">
        <strong className="mr-2 shrink-0">{getLabel("orderDetails")}:</strong>
        <span>{startDate ? startDate.toISOString().split("T")[0] : "N/A"}</span>
        {startDate && <RelativeDayBadge date={startDate} />}
      </div>
    );
  }
  return null;
}

function CalculatedOrderPrice({ value }: { value: CalculatedOrderPrice }) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <strong>{getLabel("calculatedOrderPrice")}:</strong>
      <OrdersTablePriceDialog priceObject={value} />
    </div>
  );
}

function SalesChannel({ value, row }: { value: string; row: Row<Order> }) {
  const orderId = row.original.id;
  const calculatedOrderPrice = row.original.calculatedOrderPrice;
  const isCollected = row.original.orderStatus === 'order-active' ||
    row.original.orderStatus === 'order-complete' ||
    Boolean(row.original.mythOrderSubmissionData?.devices?.length) ||
    Boolean(row.original.skidataOrderSubmissionData)

  if (value === "click-and-collect" && orderId && calculatedOrderPrice) {
    return (
      <div className="flex w-full flex-row items-center justify-between">
        <strong>{getLabel("salesChannel")}:</strong>
        <ClickAndCollectButton
          orderId={orderId}
          calculatedOrderPrice={calculatedOrderPrice}
          halfWidth={false}
          isCollected={isCollected}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <strong>{getLabel("salesChannel")}:</strong>
      <div>{String(value)}</div>
    </div>
  );
}

function TestOrder({ value }: { value: boolean | null }) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <strong>{getLabel("testOrder")}:</strong>
      <Badge variant={value ? "destructive" : "outline"} className="capitalize">
        {value ? "Yes" : "No"}
      </Badge>
    </div>
  );
}

function StripePaymentIntentId({ value, row }: { value: string | null; row: Row<Order> }) {
  const orderId = row.original.id;
  const stripeTransactionData = row.original.stripeTransactionDatas?.[0] || null;

  if (!value) {
    return (
      <div className="flex w-full flex-row items-center justify-between">
        <strong>{getLabel("stripePaymentIntentId")}:</strong>
        <span>N/A</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <strong>{getLabel("stripePaymentIntentId")}:</strong>
      <StripeDialog orderId={orderId} stripePaymentIntentId={value} stripeTransactionData={stripeTransactionData} />
    </div>
  );
}

function SimpleKeyValue({ keyName, value }: { keyName: string; value: unknown }) {
  return (
    <div className="flex w-full flex-row justify-between p-1">
      <strong className="mr-2 shrink-0">{keyName}:</strong>
      <span className="grow text-right">{String(value)}</span>
    </div>
  );
}

function IdStatusCreatedAt({ keyName, value }: { keyName: string; value: unknown }) {
  return (
    <div className="flex w-full flex-row justify-between p-1">
      <strong className="mr-2 shrink-0">{getLabel(keyName)}:</strong>
      <span className="grow text-right">{String(value)}</span>
    </div>
  );
}

export default function OrderCellContentRenderer({ keyName, value, row }: RenderValueProps) {
  switch (keyName) {
    case "clientDetails":
      return <ClientDetails value={value as ClientDetails} />;
    case "mythOrderSubmissionData":
      return <MythOrderSubmissionData value={value as MythOrderDetails} row={row} />;
    case "skidataOrderSubmissionData":
      return <SkidataOrderSubmissionData row={row} />;
    case "orderDetails":
      return <OrderDetails value={value as OrderDetails} />;
    case "calculatedOrderPrice":
      return <CalculatedOrderPrice value={value as CalculatedOrderPrice} />;
    case "salesChannel":
      return <SalesChannel value={value as string} row={row} />;
    case "testOrder":
      return <TestOrder value={value as boolean | null} />;
    case "stripePaymentIntentId":
      return <StripePaymentIntentId value={value as string | null} row={row} />;
    case "id":
    case "orderStatus":
    case "paymentStatus":
    case "createdAt":
      return <IdStatusCreatedAt keyName={keyName} value={value} />;
    default:
      return <SimpleKeyValue keyName={keyName} value={value} />;
  }
}
