// Precision calculations and formatters for Doodh Dost
// Uses integer paise arithmetic internally to eliminate floating point inaccuracies.

import { ReturnCondition, ReturnPolicyType } from '@/types/doodh_dost';

/**
 * Converts Rupees (float/number) to integer Paise
 */
export function toPaise(rupees: number): number {
  return Math.round(Number(rupees || 0) * 100);
}

/**
 * Converts integer Paise back to Rupees float (safe 2 decimals)
 */
export function toRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Formats a rupee amount with the Indian Rupee symbol (₹)
 * Example: 1250 -> "₹1,250", 1250.5 -> "₹1,250.50"
 */
export function formatINR(amount: number, showDecimals: boolean = true): string {
  const safeAmount = Number(amount || 0);
  const isWhole = Math.round(safeAmount) === safeAmount;
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals && !isWhole ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return formatted;
}

/**
 * Calculates line total for an order item: deliveredQuantity * unitPrice
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  const qty = Math.max(0, Math.floor(quantity || 0));
  const pricePaise = toPaise(unitPrice);
  const totalPaise = qty * pricePaise;
  return toRupees(totalPaise);
}

/**
 * Calculates Return Credit per packet based on policy and condition
 */
export function calculatePacketCredit(
  unitPrice: number,
  policyType: ReturnPolicyType,
  creditPercentage: number,
  condition: ReturnCondition
): number {
  const pricePaise = toPaise(unitPrice);

  if (policyType === 'no_returns') {
    return 0;
  }

  if (policyType === 'damaged_only' && condition !== 'damaged') {
    // Only damaged packets receive credit under this policy
    return 0;
  }

  if (policyType === 'full_credit') {
    return unitPrice;
  }

  if (policyType === 'partial_credit' || policyType === 'damaged_only') {
    const pct = Math.min(100, Math.max(0, creditPercentage));
    const creditPaise = Math.round((pricePaise * pct) / 100);
    return toRupees(creditPaise);
  }

  return 0;
}

/**
 * Calculates net invoice amount:
 * Delivered Value - Return Credits + Other Charges - Discounts
 */
export function calculateNetInvoice(
  deliveredValue: number,
  returnCredits: number,
  otherCharges: number = 0,
  discount: number = 0
): number {
  const deliveredPaise = toPaise(deliveredValue);
  const returnPaise = toPaise(returnCredits);
  const chargesPaise = toPaise(otherCharges);
  const discountPaise = toPaise(discount);

  const netPaise = deliveredPaise - returnPaise + chargesPaise - discountPaise;
  return Math.max(0, toRupees(netPaise));
}

/**
 * Calculates remaining shop balance after a payment:
 * Closing Balance = Previous Balance + New Invoice Amount - Payments Received
 */
export function calculateClosingBalance(
  previousBalance: number,
  invoiceNetAmount: number,
  paymentsReceived: number
): number {
  const prevPaise = toPaise(previousBalance);
  const invoicePaise = toPaise(invoiceNetAmount);
  const paidPaise = toPaise(paymentsReceived);

  const closingPaise = prevPaise + invoicePaise - paidPaise;
  return toRupees(closingPaise);
}

/**
 * Calculates Available Stock according to the business formula:
 * Available Stock = Opening Stock + Stock Received + Saleable Returns - Delivered Qty - Damaged Qty
 */
export function calculateAvailableStock(
  openingStock: number,
  stockReceived: number,
  saleableReturns: number,
  deliveredQty: number,
  damagedQty: number,
  manualAdjustments: number = 0
): number {
  return (
    Number(openingStock || 0) +
    Number(stockReceived || 0) +
    Number(saleableReturns || 0) -
    Number(deliveredQty || 0) -
    Number(damagedQty || 0) +
    Number(manualAdjustments || 0)
  );
}

/**
 * Generates an idempotent human-readable code
 */
export function generateEntityNumber(prefix: string, sequenceNumber: number): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const seq = String(sequenceNumber).padStart(3, '0');
  return `${prefix}-${yyyy}${mm}${dd}-${seq}`;
}
