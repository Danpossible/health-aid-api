/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GENDER,
  PORTFOLIO,
  ACCOUNT_STATUS,
  NOTIFICATION_TYPES,
  HEALTH_WORKER_TYPE,
  AVAILABILITY,
} from './config/constants';
interface PaginationOptions {
  populate?: string;
  select?: string;
  orderBy?: string;
  limit?: string;
  page?: string;
}

export interface BankInterface {
  id: string;
  name: string;
  sortCode: string;
  uuid: string;
  interInstitutionCode: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type ErrorTracker = {
  id: string;
  stackTrace: Map;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};
interface RegulateTransaction {
  id: string;
  idempotentKey: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

interface HealthAidEarnings extends AuditableFields {
  id: string;
  user: User | string;
  driver: Driver | string;
  for: PORTFOLIO;
  amount: number;
  charge: number;
  source: string;
  profit: number;
  amountSpent: number;
  transaction: TransactionLogInterface | string | null;
  earningsIn: 'kuda' | 'flutterwave' | 'paga';
}

interface TransactionLog extends AuditableFields {
  id: string;
  patient: Patient | string;
  healthWorker: HealthWorker | string;
  for: PORTFOLIO;
  amount: number;
  balanceAfterTransaction: number;
  transactionDump: TransactionDump | string | null;
  type: TRANSACTION_TYPES;
  category: string | null;
  source: TRANSACTION_SOURCES;
  reference: string | null;
  purpose: string | null;
  meta: object | null;
  pending: boolean | null;
  status: TRANSACTION_STATUS;
  locked: boolean | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  fees: number | null;
}

interface Waitlist extends AuditableFields {
  id: string;
  _id: string;
  email: string;
}

interface CheckAccountBalanceRequest {
  referenceNumber: string;
  accountPrincipal: string;
  accountCredentials: string;
  sourceOfFunds: string;
  locale: string;
}

interface PagaBaseResponse {
  error: boolean;
  responseCode?: string;
  statusCode?: string;
}

interface CheckAccountBalanceResponse extends PagaBaseResponse {
  referenceNumber: string;
  message: string;
  totalBalance: string;
  availableBalance: number;
  currency: null;
  balanceDateTimeUTC: null;
}

interface PaginationModel<T> {
  totalData: number | undefined;
  limit: number | undefined;
  totalPages: number | undefined;
  page: number | undefined;
  data: T[];
}
interface Patient extends AuditableFields {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
  portfolio: PORTFOLIO;
  residentialAddress?: string;
  verifiedAt: Date;
  verificationToken: string;
  verificationTokenExpiry: Date;
  resetToken: string;
  resetTokenExpiresAt: Date;
  pushNotificationId: string;
  allowPushNotification: boolean;
  appVersion?: string;
  gender?: GENDER;
  phoneNumber: string;
  avatar: string;
  systemCode: string;
  dob?: Date;
  deviceInfo: typeof Map;
  referralCode: string;
  inviteCode: string;
  accountStatus: {
    status: ACCOUNT_STATUS;
    reason: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    state?: string;
    country?: string;
  };
}
interface HealthWorker extends AuditableFields {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
  portfolio: PORTFOLIO;
  healthWorkerType?: HEALTH_WORKER_TYPE;
  availability?: AVAILABILITY;
  verifiedAt: Date;
  verificationToken: string;
  verificationTokenExpiry: Date;
  resetToken: string;
  resetTokenExpiresAt: Date;
  pushNotificationId: string;
  allowPushNotification: boolean;
  appVersion?: string;
  gender?: GENDER;
  systemCode: string;
  phoneNumber: string;
  avatar: string;
  deviceInfo: typeof Map;
  referralCode: string;
  inviteCode: string;
  accountStatus: {
    status: ACCOUNT_STATUS;
    reason: string;
  };
  lastLogin?: Date;
  specialization?: string[];
  experience?: string[];
  location?: {
    latitude: number;
    longitude: number;
    state?: string;
    country?: string;
    address?: string;
  };
  kyc?: {
    driversLicense: {
      number: number;
      image: {
        url: string;
        publicId: string;
      };
    };
    medicalLicense: {
      number: number;
      image: {
        url: string;
        publicId: string;
      };
    };
    medicalCertificate: {
      url: string;
      publicId: string;
    };
    certifications: {
      name: string;
      image: {
        url: string;
        publicId: string;
      };
    }[];
  };
}

export interface Admin extends AuditableFields {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerifiedAt: Date;
  emailVerificationToken: string;
  emailVerificationTokenExpiry: Date;
  resetToken: string;
  resetTokenExpiresAt: Date;
  accountStatus: {
    status: ACCOUNT_STATUS;
    reason: string;
    updatedBy: Admin | string;
    updatedAt: Date;
  };
  role: ADMIN_ROLE;
  phoneNumber: string;
  walletNumber: string;
  avatar: {
    url: string;
    publicId: string;
  };
  gender: GENDER;
}

interface AuditableFields {
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  createdBy?: Patient | HealthWorker | string;
  updatedBy?: Patient | HealthWorker | string;
  deletedBy?: Patient | HealthWorker | string;
}

export type ErrorTracker = {
  id: string;
  stackTrace: Map;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

type ObjT = {
  [key: string]: any;
};

interface Notification {
  id: string;
  patient: Patient | string;
  healthWorker: HealthWorker | string;
  title: string;
  meta: Map;
  message: string;
  read: boolean;
  for: PORTFOLIO;
  type: NOTIFICATION_TYPES;
  priority: number;
}

export interface SendChampConstructor {
  publicKey: string;
  mode?: 'test' | 'live' | 'local-simulator';
}

export interface SendChampEndpoints {
  SEND_SMS: string;
  SEND_VOICE: string;
  getReport: (sms_message_id: string) => string;
  REGISTER_SENDER: string;
  SEND_VERIFICATION_OTP: string;
  VERIFY_VERIFICATION_OTP: string;
  SEND_WHATSAPP: string;
}

export type SendChampBaseUrls = {
  [x: string]: string;
};

export interface SendSMSConfig {
  route?: 'non_dnd' | 'dnd' | 'international';
  to: string | Array<string>;
  message: string;
  sender_name: string;
}

export interface SendOtpConfig {
  channel: 'sms' | 'email';
  sender: string;
  token_type: 'numeric' | 'alphanumeric';
  token_length: number;
  expiration_time: number; // In minutes
  customer_email_address?: string;
  customer_mobile_number?: string;
  meta_data?: Record<string | number, unknown>;
}

export interface VerifyOtpConfig {
  verification_reference: string;
  verification_code: string;
}

export interface RegisterSenderConfig {
  name: string;
  use_case: 'transactional' | 'marketing' | 'transaction_marketing';
  sample: string;
}

export interface SendWHATSAPPTemplateConfig {
  sender: string;
  recipient: string;
  template_code: string;
  meta_data: { [x: string]: string };
}

export interface SendWHATSAPPTextConfig {
  recipient: string;
  sender: string;
  message: string;
}

export interface SendWHATSAPPVideoConfig {
  recipient: string;
  sender: string;
  link: string;
}

export interface SendWHATSAPPAudioConfig {
  recipient: string;
  sender: string;
  link: string;
  message: string;
}

export interface SendWHATSAPPLocationConfig {
  recipient: string;
  sender: string;
  longitude: number;
  latitude: number;
  name: string;
  address: string;
}

export interface SendSMSResponse {
  message: string;
  code: string;
  status: 'success' | 'error';
  data: SMSResponseData;
}

export interface SendVOICEResponse {
  message: string;
  code: string;
  data: VOICEResponseData;
  status: 'success' | 'error';
}

export interface SendOtpResponse {
  message: string;
  code: string;
  status: 'success' | 'error';
  data: SendOtpResponseData;
}

export interface VerifyOtpResponse {
  message: string;
  code: string;
  status: 'success' | 'error';
  data: VerifyOtpResponseData;
}

export interface SendWHATSAPPResponse {
  message: string;
  code: string;
  status: 'success' | 'error';
  data: SendWhatsappResponseData;
}

interface SendWhatsappResponseData {
  provider_reference: string;
  provider_message: string;
  provider_status: string;
}

interface SMSResponseData {
  status: string;
  business: string;
  id: string;
  uid?: string;
  business_uid?: string;
  name?: string;
  phone_number?: string;
  amount: string;
  reference: string;
  message_references?: Array<string>;
  delivered_at?: string;
  sent_at?: string;
}

interface VOICEResponseData {
  phone_number: string;
  id: string;
  status: string;
  reference: string;
}

interface SendOtpResponseData {
  business_uid: string;
  reference: string;
  channel: {
    id: number;
    name: string;
    is_active: boolean;
  };
  token?: string;
  status: string;
}

interface VerifyOtpResponseData {
  id: string;
  business_id: string;
  business_customer_id: string;
  channel_id: string;
  verification_code: string;
  delivery_status: string;
  verification_status: string;
  expires_at: string;
  verification_time: string;
  created_at: string;
  updated_at: string;
  verification_reference: string;
  meta_data: unknown;
}

interface Wallet extends AuditableFields {
  patient: Patient | string;
  healthWorker: HealthWorker | string;
  walletFor: PORTFOLIO;
  id: string;
  walletNumber: string;
  transactionPin: string;
  walletName: string;
  bankName: string;
  availableBalance: number;
  balance: {
    available: number;
    ledger: number;
  };
  walletNumber: string;
  locked: boolean;
  walletName: string;
  bankName: string;
  bankReferenceNumber: string;
  walletReference: string;
  stash: string;
  callbackUrl: string;
  __v: number;
  systemCode: string;
}

interface PagaResponse extends PagaBaseResponse {
  [key: string]: string;
}

interface RegisterPersistentPaymentAccount {
  referenceNumber: string;
  phoneNumber: string;
  firstName: string;
  lastName?: string;
  accountName: string;
  financialIdentificationNumber?: string;
  walletReference: string;
  creditBankId?: string | null;
  creditBankAccountNumber?: string | null;
  callbackUrl: string | null;
  user?: string | null;
  currency: string;
}

interface InAppTransfer {
  narration: string;
  amount: number;
  idempotentKey: string;
  walletNumber: string;
  purpose: string;
}

export interface purchaseUtilitiesType extends PagaBaseResponse {
  merchant: string;
  merchantNumber: string;
  amount: string;
  merchantServiceProductCode: string;
  utilityType: string;
}

interface Notification {
  id: string;
  user: User | string;
  driver: Driver | string;
  title: string;
  meta: Map;
  message: string;
  read: boolean;
  for: PORTFOLIO;
  type: NOTIFICATION_TYPES;
  priority: number;
}

interface TransactionDump extends AuditableFields {
  id: string;
  data: object;
  user: User | string;
  driver: Driver | string;
  type: TRANSACTION_DUMP_TYPES;
}
interface BaseResponse {
  error: boolean;
  status: string;
  message: string;
  Message: string;
}
