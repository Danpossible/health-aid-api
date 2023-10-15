import Joi from 'joi';
import { GENDER } from '../../config/constants';

export const createAgent = {
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
  }),
};
