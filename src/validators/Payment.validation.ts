import Joi from 'joi';

export const buyAirtime = {
  body: Joi.object({
    amount: Joi.number().positive().required(),
    phoneNumber: Joi.string().required().min(10).max(14),
    mobileOperatorId: Joi.string().required(),
  }),
};

export const buyData = {
  body: Joi.object().keys({
    amount: Joi.number().required().positive(),
    destinationPhoneNumber: Joi.string().required().min(10).max(14),
    mobileOperatorServiceId: Joi.number().required(),
    mobileOperatorId: Joi.string().required(),
  }),
};

export const withdrawal = {
  body: Joi.object().keys({
    amount: Joi.number().required().positive(),
    idempotentKey: Joi.string().required().min(16),
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
    purpose: Joi.string(),
  }),
};

export const inAppTransfer = {
  body: Joi.object().keys({
    amount: Joi.number().required().positive(),
    idempotentKey: Joi.string().required().min(16),
    walletNumber: Joi.string().required(),
    purpose: Joi.string(),
  }),
};

export const validateAccount = {
  body: Joi.object().keys({
    bankId: Joi.string().required(),
    accountNumber: Joi.string().required(),
  }),
};

export const purchaseUtilities = {
  body: Joi.object().keys({
    amount: Joi.number().required().positive(),
    merchantNumber: Joi.string().required(),
    merchantServiceProductCode: Joi.string().required(),
    merchant: Joi.string().required(),
    utilityType: Joi.string().required(),
  }),
};

export const getUtilitiesProvidersServices = {
  body: Joi.object().keys({
    merchantId: Joi.string(),
    referenceNumber: Joi.string(),
  }),
};

export const validatePaymentCallback = {
  body: Joi.object().keys({
    status: Joi.string().required(),
    transactionId: Joi.string().required(),
    txRef: Joi.string().required(),
    idempotentKey: Joi.string().required().min(16),
  }),
};

export const transactionPin = {
  body: Joi.object().keys({
    pin: Joi.string().required().min(4).max(4),
  }),
};

export const lockUserWallet = {
  body: Joi.object().keys({
    locked: Joi.boolean().required(),
    reason: Joi.string().required(),
  }),
};
