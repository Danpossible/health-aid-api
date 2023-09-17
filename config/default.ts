import dotenv from 'dotenv';
import Joi from 'joi';
dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .required()
      .valid('development', 'production', 'staging', 'test'),
    ENVIRONMENT: Joi.string()
      .required()
      .valid('development', 'production', 'staging', 'test'),
    PORT: Joi.number().default(8080).required(),
    API_DOMAIN: Joi.string().description('API Domain'),
    ENFORCE_SSL: Joi.bool()
      .default(false)
      .description('This is to determine whether to use HTTP or HTTPS'),
    USE_PORT: Joi.bool()
      .default(false)
      .description('This is to determine whether to use the PORT value'),
    DATABASE_URL: Joi.string().label('MONGO Database URL'),
    APP_NAME: Joi.string().required().label('App Name').default('AGSAAP'),
    JWT_ACCESS_TOKEN_EXPIRES: Joi.string()
      .default('1h')
      .label('JWT Access Token Expires')
      .required(),
    JWT_REFRESH_TOKEN_EXPIRES: Joi.string()
      .default('24h')
      .label('JWT Refresh Token Expires')
      .required(),
    MAIL_FROM: Joi.string().required().label('Mail From').required(),
    MAIL_USER: Joi.string().required().label('Mail User').required(),
    MAIL_PASSWORD: Joi.string().required().label('Mail Password').required(),
    MAIL_HOST: Joi.string().required().label('Mail Host').required(),
    MAIL_PORT: Joi.number().required().label('Mail Port').required(),
    SEND_CHAMP_BASE_URL: Joi.string().label('Send Champ Base URL').required(),
    SEND_CHAMP_MODE: Joi.string()
      .label('Send Champ Mode')
      .required()
      .valid('TEST', 'LIVE'),
    SEND_CHAMP_SENDER_NAME: Joi.string()
      .label('Send Champ Sender Name')
      .required(),
    CLOUDINARY_NAME: Joi.string().label('Cloudinary Name').required(),
    CLOUDINARY_API_KEY: Joi.string().label('Cloudinary API Key').required(),
    CLOUDINARY_API_SECRET: Joi.string()
      .label('Cloudinary API Secret')
      .required(),
  })
  .unknown();
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  environment: envVars.ENVIRONMENT,
  DATABASE_URL: envVars.DATABASE_URL,
  port: envVars.PORT,
  appName: envVars.APP_NAME,
  jwtAccessTokenExpiration: envVars.JWT_ACCESS_TOKEN_EXPIRES,
  jwtRefreshTokenExpiration: envVars.JWT_REFRESH_TOKEN_EXPIRES,
  name: envVars.APP_NAME,
  from: envVars.MAIL_FROM,
  MAIL_HOST: envVars.MAIL_HOST,
  MAIL_PASSWORD: envVars.MAIL_PASSWORD,
  MAIL_USER: envVars.MAIL_USER,
  MAIL_PORT: envVars.MAIL_PORT,
  baseApiUrl: `${envVars.ENFORCE_SSL ? 'https' : 'http'}://${
    envVars.API_DOMAIN
  }${envVars.USE_PORT ? `:${envVars.PORT}` : ''}`,
  googleMapsApiKey: envVars.GOOGLE_MAPS_API_KEY,
  redis: {
    host: envVars.REDIS_HOST,
    port: parseInt(envVars.REDIS_PORT || '6379'),
    url: envVars.REDIS_URL,
  },
  sendChamp: {
    apiKey: envVars.SEND_CHAMP_PUB_KEY,
    baseUrl: envVars.SEND_CHAMP_BASE_URL,
    mode: envVars.SEND_CHAMP_MODE,
    senderName: envVars.SEND_CHAMP_SENDER_NAME,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  paymentData: {
    paga_secret: envVars.PAGA_API_SECRET,
    paga_key: envVars.PAGA_API_KEY,
    paga_public_key: envVars.PAGA_API_PUBLIC_KEY,
    paga_url: envVars.PAGA_API_URL,
    withdrawalFee: envVars.WITHDRAWAL_FEE,
    isPagaTestEnv: envVars.PAGA_TEST_ENVIRONMENT,
    pagaAuthorizationKey: envVars.PAGA_AUTHORIZATION_KEY,
    depositCharge: envVars.DEPOSIT_CHARGE,
    withdrawalProcessingCost: envVars.WITHDRAWAL_PROCESSING_COST,
    withdrawalCharge: envVars.WITHDRAWAL_CHARGE,
  },
};
