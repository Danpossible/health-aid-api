export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ACCOUNT_STATUS {
  INVITATION_SENT = 'invitation_sent',
  CONFIRMED = 'confirmed',
  DEACTIVATED = 'deactivated',
  COMPROMISED = 'compromised',
  PENDING = 'pending',
}

export enum PORTFOLIO {
  PATIENT = 'patient',
  HEALTH_WORKER = 'health_worker',
}

export enum HEALTH_WORKER_TYPE {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  PHARMACIST = 'pharmacist',
  LAB_SCIENTIST = 'lab_scientist',
}

export enum PAYMENT_SOURCE {
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
}

export enum FLUTTERWAVE_TRANSACTION_STATUS {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum TRANSACTION_TYPES {
  CREDIT = 'credit',
  DEBIT = 'debit',
  LOAN = 'loan',
  REFUND = 'refund',
}

export enum TRANSACTION_SOURCES {
  BANK_TRANSFER = 'bank_transfer',
  CARD_DEPOSIT = 'card_deposit',
  PAYMENT_LINK = 'payment_link',
  AVAILABLE_BALANCE = 'available_balance',
  LEDGER_BALANCE = 'ledger_balance',
  RESERVED_BALANCE = 'reserved_balance',
  STASH = 'stash',
  REVERSAL = 'reversal',
  SUBSCRIPTION = 'subscription',
  USER_TRANSFER = 'user_transfer',
  REFERRAL_BONUS = 'referral_bonus',
}

export enum TRANSACTION_STATUS {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export enum STATUS {
  ACTIVE = 'active',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  DEACTIVATED = 'deactivated',
  DENIED = 'denied',
}

export enum IMAGE_CLOUD_PROVIDERS {
  CLOUDINARY = 'cloudinary',
}

export enum CARD_BRANDS {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  VERVE = 'verve',
}

export enum CARD_TYPES {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum TRANSACTION_DUMP_TYPES {
  SUBSCRIPTION = 'subscription',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  DISPUTE = 'dispute',
  WITHDRAWAL = 'withdrawal',
  REFERRAL_BONUS = 'referral_bonus',
}

export enum PAGA_BANK_ENDPOINT {
  BANKS = 'banks',
  GET_BANKS = 'getBanks',
  PAYMENT_REQUEST = 'paymentRequest',
  STATUS = 'status',
  HISTORY = 'history',
  UPDATE_PERSISTENT_PAYMENT_ACCOUNT = 'updatePersistentPaymentAccount',
  DELETE_PERSISTENT_PAYMENT_ACCOUNT = 'deletePersistentPaymentAccount',
  REGISTER_PERSISTENT_PAYMENT_ACCOUNT = 'registerPersistentPaymentAccount',
  REFUND = 'refund',
  GET_PERSISTENT_PAYMENT_ACCOUNT = 'getPersistentPaymentAccount',
  GET_MOBILE_OPERATORS = 'getMobileOperators',
}

export enum CURRENCIES {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
}

export enum CARD_TYPES {
  SAVED_CARD = 'savedCard',
  NEW_CARD = 'newCard',
}

export enum RIDE_HAILING_STATUS {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RIDE_TYPE {
  HIRE = 'hire',
  GROUP_SUBSCRIPTION = 'group_subscription',
  INDIVIDUAL_SUBSCRIPTION = 'individual_subscription',
}

export enum SUBSCRIPTION_PLANS {
  weekly = 'weekly',
  weekends = 'weekends',
  weekdays = 'weekdays',
  monthly = 'monthly',
}

export enum Patient_GROUP_SUBSCRIPTION_STATUS {
  ACCEPTED = 'accepted',
  PENDING = 'pending',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum SUBSCRIPTION_STATUS {
  ACTIVE = 'active',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SUBSCRIPTION_TYPE {
  GROUP = 'group',
  INDIVIDUAL = 'individual',
}

export enum PAID_WITH {
  CARD = 'card',
  WALLET = 'wallet',
}

export enum NOTIFICATION_TYPES {
  TRANSACTION_NOTIFICATION = 'transaction_notification',
  WALLET_NOTIFICATION = 'wallet_notification',
}

export enum AVAILABILITY {
  AVAILABLE_IN_PERSON = 'available_in_person',
  AVAILABLE_REMOTE = 'available_remote',
  AVAILABLE_IN_PERSON_AND_REMOTE = 'available_in_person_and_remote',
  OFFLINE = 'offline',
}

export enum ADMIN_ROLE {
  SUPER_ADMIN = 'super_admin',
  SUB_ADMIN = 'sub_admin',
  TRANSACTION = 'transaction',
  ENGINEER = 'engineer',
  FINANCE = 'finance',
  SUPPORT = 'support',
}

export enum WS_EVENT {
  CONNECTION = 'connection',
  CONNECTED = 'connected',
  DISCONNECT = 'disconnect',
  REQUEST_ERROR = 'request_error',
  RIDE_REQUEST = 'ride_request',
  RIDE_ACCEPTED = 'ride_accepted',
  RIDE_HAILING_ACCEPTED = 'ride_hailing_accepted',
  RIDE_HAILING_STARTED = 'ride_hailing_started',
  INITIATE_CARD_PAYMENT = 'initiate_card_payment',
  INITIATE_RIDE_SUBSCRIPTION_REQUEST = 'initiate_ride_subscription_request',
  INITIATE_RIDE_SUBSCRIPTION_RESPONSE = 'initiate_ride_subscription_response',
  INITIATE_RIDE_HIRE_REQUEST = 'initiate_ride_hire_request',
  UPDATE_HealthWorker_LOCATION = 'update_HealthWorker_location',
  UPDATE_Patient_LOCATION = 'update_Patient_location',
  JOIN_ROOM = 'join_room',
  SEND_LIVE_LOCATION = 'send_live_location',
  RECEIVE_LIVE_LOCATION = 'receive_live_location',
  ACCEPT_RIDE_HIRE_REQUEST = 'accept_ride_hire_request',
  ACCEPT_RIDE_SUBSCRIPTION_REQUEST = 'accept_ride_subscription_request',
  GET_NEARBY_HealthWorkerS = 'get_nearby_HealthWorkers',
  IN_APP_TRANSFER_REQUEST = 'in_app_transfer_request',
  IN_APP_TRANSFER_RESPONSE = 'in_app_transfer_response',
  GET_Patient_WALLET_BY_SYSTEM_CODE = 'get_Patient_wallet_by_system_code',
  GET_Patient_BALANCE = 'get_Patient_balance',
}

export enum MIXPANEL_EVENTS {
  LOGIN = 'Patient Logged In',
  SIGNUP = 'Patient Signed Up',
  VERIFY_ACCOUNT = 'Patient Verified Account',
  RIDE_REQUEST = 'Patient requested ride',
  HealthWorker_ACCEPTED_RIDE_REQUEST = 'HealthWorker accepted ride request',
  HealthWorker_CANCELLED_RIDE = 'HealthWorker cancelled ride',
  HealthWorker_COMPLETED_RIDE = 'HealthWorker completed ride',
  WITHDRAW = 'Patient Withdraws money',
  INITIATE_CARD_PAYMENT = 'Patient initiates card payment',
  IN_APP_PAYMENT = 'Patient makes in-app payment',
  DEDICATED_WALLET_CREATED = 'Patient creates dedicated wallet',
  CREATE_GROUP_RIDE_SUBSCRIPTION = 'Patient creates group ride subscription',
  CREATE_INDIVIDUAL_RIDE_SUBSCRIPTION = 'Patient creates individual ride subscription',
  JOIN_GROUP_RIDE_SUBSCRIPTION = 'Patient joins group ride subscription',
  INITIATE_RIDE_HIRE_REQUEST = 'Patient initiates ride hire request',
  ACCEPT_RIDE_HIRE_REQUEST = 'HealthWorker accepts ride hire request',
  ADDED_TO_GROUP_RIDE_SUBSCRIPTION = 'Patient added to group ride subscription',
  INITIATE_CARD_PAYMENT_FOR_RIDE_SUBSCRIPTION = 'Patient initiates card payment for ride subscription',
  ACCEPT_RIDE_SUBSCRIPTION_REQUEST = 'HealthWorker accepts ride subscription request',
}
