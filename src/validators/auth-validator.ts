import Joi from 'joi';
import {
  ADMIN_ROLE,
  AVAILABILITY,
  GENDER,
  HEALTH_WORKER_TYPE,
  PORTFOLIO,
} from '../../config/constants';

export const LoginValidator = {
  body: Joi.object().keys({
    email: Joi.string().email().lowercase().required().messages({
      'any.email': 'Oops!, you need to provide valid email address',
      'any.required': 'Oops!, you have to specify an email address',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Oops!, password must be at least 8 characters long',
      'any.required': 'Oops!, you have to specify a password',
    }),
    pushNotificationId: Joi.string().required(),
  }),
};

export const AgentLoginValidator = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().messages({
      'any.required': 'Oops!, you have to specify a phone number',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Oops!, password must be at least 8 characters long',
      'any.required': 'Oops!, you have to specify a password',
    }),
  }),
};

export const AdminLoginValidator = {
  body: Joi.object().keys({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'org', 'ng'] },
      })
      .lowercase()
      .required()
      .messages({
        'any.email': 'Oops!, you need to provide valid email address',
        'any.required': 'Oops!, you have to specify an email address',
      }),
    password: Joi.when('loginOption', {
      is: 'email',
      then: Joi.string().min(8).required().messages({
        'string.min': 'Oops!, password must be at least 8 characters long',
        'any.required': 'Oops!, you have to specify a password',
      }),
    }),
  }),
};

export const createUserValidator = {
  body: Joi.object().keys({
    firstName: Joi.string().min(3).lowercase().max(40).required(),
    lastName: Joi.string().min(3).lowercase().max(40).required(),
    middleName: Joi.string().min(1).lowercase().max(40).optional(),
    portfolio: Joi.string()
      .valid(...Object.values(PORTFOLIO))
      .required(),
    email: Joi.string().lowercase().optional().messages({
      'string.email': 'Oops!, you need to provide valid email address',
      'string.required': 'Oops!, you have to specify an email address',
    }),
    phoneNumber: Joi.string()
      .min(10)
      .max(14)
      .strict()
      .messages({
        'string.required': 'Oops!, you have to specify a phone number',
      })
      .required(),
    /** Password requirements:
     * At least 8 characters—the more characters, the better
     * A mixture of both uppercase and lowercase - letters
     * A mixture of letters and numbers
     * Inclusion of at least one special character, e.g., ! @ # ? ]
     */
    password: Joi.string()
      .min(6)
      .pattern(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
        ),
      )
      .required()
      .messages({
        'string.pattern.base':
          'Oops!, password must be at least 6 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'string.required': 'Oops!, you have to specify a password',
      }),
    confirmPassword: Joi.ref('password'),
    gender: Joi.string()
      .required()
      .valid(...Object.values(GENDER)),
    inviteCode: Joi.string().optional(),
    healthWorkerType: Joi.when('portfolio', {
      is: PORTFOLIO.HEALTH_WORKER,
      then: Joi.string()
        .required()
        .valid(...Object.values(HEALTH_WORKER_TYPE)),
    }),
  }),
};

export const VerifyOtpValidator = {
  body: Joi.object().keys({
    otp: Joi.string().required().min(6).max(6),
    pushNotificationId: Joi.string().required(),
  }),
};

export const ResendPatientEmailVerificationValidator = {
  body: Joi.object().keys({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      })
      .lowercase()
      .required()
      .messages({
        'string.email': 'Oops!, you need to provide valid email address',
        'string.required': 'Oops!, you have to specify an email address',
      }),
  }),
};

export const RegenerateAccessToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const ResetPasswordValidator = {
  body: Joi.object().keys({
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('password'),
    token: Joi.string().required(),
  }),
};

export const verifyPatientEmailValidator = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
  }),
};

export const validateInviteCode = {
  body: Joi.object().keys({
    inviteCode: Joi.string().required(),
  }),
};

export const forgotPasswordValidator = {
  body: Joi.object().keys({
    // phoneNumber: Joi.string().max(15).min(11).strict().optional().messages({
    //   'any.required': 'Oops!, you have to specify a phone number',
    // }),
    email: Joi.string().email().required().messages({
      'any.required': 'Oops!, you have to specify an email address',
    }),
  }),
};

export const resendOtpValidator = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().messages({
      'any.required': 'Oops!, you have to specify a phone number',
    }),
  }),
};

export const updatePatientAccount = {
  body: Joi.object().keys({
    firstName: Joi.string().min(3).lowercase().max(40).optional(),
    lastName: Joi.string().min(3).lowercase().max(40).optional(),
    phoneNumber: Joi.string().max(15).strict().optional().messages({
      'string.optional': 'Oops!, you have to specify a phone number',
    }),
    residentialAddress: Joi.string().optional(),
    avatar: Joi.string().optional().uri(),
    role: Joi.string()
      .optional()
      .valid(...Object.values(PORTFOLIO)),
    gender: Joi.string()
      .optional()
      .valid(...Object.values(GENDER)),
    availability: Joi.string()
      .optional()
      .valid(...Object.values(AVAILABILITY)),
  }),
};

export const waitList = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const createAdminValidator = {
  body: Joi.object().keys({
    firstName: Joi.string().min(3).lowercase().max(40).required(),
    lastName: Joi.string().min(3).lowercase().max(40).required(),
    middleName: Joi.string().min(1).lowercase().max(40).optional(),
    email: Joi.string().email().lowercase().required().messages({
      'string.email': 'Oops!, you need to provide valid email address',
      'string.required': 'Oops!, you have to specify an email address',
    }),
    phoneNumber: Joi.string().min(10).max(14).strict().required().messages({
      'string.required': 'Oops!, you have to specify a phone number',
    }),
    gender: Joi.string().valid(...Object.values(GENDER)),
    /** Password requirements:
     * At least 8 characters—the more characters, the better
     * A mixture of both uppercase and lowercase - letters
     * A mixture of letters and numbers
     * Inclusion of at least one special character, e.g., ! @ # ? ]
     */
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&-_+=*])(?=.{8,})',
        ),
      )
      .required()
      .messages({
        'string.pattern.base':
          'Oops!, password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'string.required': 'Oops!, you have to specify a password',
      }),
    confirmPassword: Joi.ref('password'),
    role: Joi.string()
      .optional()
      .valid(...Object.values(ADMIN_ROLE)),
  }),
};

export const updateAdmin = {
  body: Joi.object().keys({
    firstName: Joi.string().min(3).lowercase().max(40).optional(),
    lastName: Joi.string().min(3).lowercase().max(40).optional(),
    middleName: Joi.string().min(1).lowercase().max(40).optional(),
    email: Joi.string().email().lowercase().optional().messages({
      'string.email': 'Oops!, you need to provide valid email address',
      'string.optional': 'Oops!, you have to specify an email address',
    }),
    phoneNumber: Joi.string().min(10).max(14).strict().optional().messages({
      'string.optional': 'Oops!, you have to specify a phone number',
    }),
    /** Password requirements:
     * At least 8 characters—the more characters, the better
     * A mixture of both uppercase and lowercase - letters
     * A mixture of letters and numbers
     * Inclusion of at least one special character, e.g., ! @ # ? ]
     */
    oldPassword: Joi.when('password', {
      is: Joi.exist(),
      then: Joi.string()
        .min(8)
        .pattern(
          new RegExp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&-_=+~*])(?=.{8,})',
          ),
        )
        .required()
        .messages({
          'string.pattern.base':
            'Oops!, password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          'string.required': 'Oops!, you have to specify a password',
        }),
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
        ),
      )
      .optional()
      .messages({
        'string.pattern.base':
          'Oops!, password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'string.optional': 'Oops!, you have to specify a password',
      }),
    confirmPassword: Joi.when('password', {
      is: Joi.exist(),
      then: Joi.ref('password'),
    }),
    role: Joi.string()
      .valid(...Object.values(ADMIN_ROLE))
      .optional(),
    accountStatus: Joi.object().keys({
      status: Joi.string().required(),
      reason: Joi.string().required(),
    }),
    avatar: Joi.string().optional(),
  }),
};

export const resetPassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.ref('newPassword'),
  }),
};
