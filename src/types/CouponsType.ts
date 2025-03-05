/**
 * Types related to Capillary and Kibo Commerce integration
 * 
 * This file contains types for both:
 * 1. Capillary API - The source system where coupons are fetched from
 * 2. Kibo Commerce - The target system where coupons are sent to
 */

/**
 * ==========================================
 * CAPILLARY API TYPES (SOURCE SYSTEM)
 * ==========================================
 */

/**
 * Represents a custom property in a Capillary coupon
 */
export interface CustomProperty {
  name: string;
  value: string;
}

/**
 * Represents a location where a Capillary coupon was issued
 */
export interface IssuedAt {
  code: string;
  name: string;
}

/**
 * Represents a redemption or reversed redemption record in Capillary
 */
export interface RedemptionRecord {
  // Add properties as needed when available in the data
}

/**
 * Represents a coupon from Capillary API
 */
export interface CapillaryCoupon {
  code: string;
  seriesId: number;
  description: string;
  validTill: string;
  discountType: string;
  discountValue: number;
  discountUpto: number;
  redemptionCount: number;
  redemptionsLeft: number;
  id: number;
  createdDate: string;
  transactionNumber: string;
  issuedAt: IssuedAt;
  customProperty: CustomProperty[];
  redemptions: RedemptionRecord[];
  reversedRedemptions: RedemptionRecord[];
}

/**
 * Represents a customer in the Capillary system
 */
export interface CapillaryCustomer {
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  id: number;
  externalId: string;
  coupons: CapillaryCoupon[];
}

/**
 * Represents pagination information in Capillary API
 */
export interface Pagination {
  limit: string;
  offset: string;
  total: number;
}

/**
 * Represents the entity part of the Capillary API response
 */
export interface CapillaryEntity {
  pagination: Pagination;
  customers: CapillaryCustomer[];
}

/**
 * Represents the complete response from the Capillary API for coupons
 */
export interface CapillaryCouponResponse {
  entity: CapillaryEntity;
  warnings: any[];
  errors: any[];
  success: boolean;
}

/**
 * Represents a reward from Capillary (legacy format)
 */
export interface CapillaryReward {
  memberRewardId: string;
  dateIssued: string;
  displayName: string;
  [key: string]: any; // For additional properties that might be returned by the API
}

/**
 * ==========================================
 * KIBO COMMERCE TYPES (TARGET SYSTEM)
 * ==========================================
 */

/**
 * Represents a formatted coupon for Kibo Commerce
 */
export interface KiboCoupon {
  code: string;
  currencyCode: string;
  customCreditType: string;
  creditType: string;
  initialBalance: number;
  currentBalance: number;
  isEnabled: boolean;
  activationDate: string;
}

/**
 * ==========================================
 * COMMON TYPES AND RESPONSES
 * ==========================================
 */

/**
 * Represents an error response from the Capillary API
 */
export interface CapillaryErrorResponse {
  error: any;
}

/**
 * Represents a successful response from the Capillary API
 */
export interface CapillarySuccessResponse<T> {
  data: T;
}

/**
 * Represents the response from the getActiveCoupons function
 * Returns either Kibo-formatted coupons or an error
 */
export type GetActiveCouponsResponse = KiboCoupon[] | CapillaryErrorResponse;

/**
 * Represents the response from the redeemCoupon function
 */
export type RedeemCouponResponse = CapillarySuccessResponse<any> | CapillaryErrorResponse;

/**
 * Represents the response from the unredeemCoupon function
 */
export type UnredeemCouponResponse = CapillarySuccessResponse<any> | CapillaryErrorResponse; 