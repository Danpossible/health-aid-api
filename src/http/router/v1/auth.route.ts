import { Router, Request, Response, NextFunction } from 'express';
import {
  createUserValidator,
  forgotPasswordValidator,
  LoginValidator,
  RegenerateAccessToken,
  ResetPasswordValidator,
  verifyPatientEmailValidator,
  resendOtpValidator,
  validateInviteCode,
  createAdminValidator,
  AdminLoginValidator,
  ResendPatientEmailVerificationValidator,
} from '../../../validators/auth-validator';
import validate from '../../middlewares/validate';
import {
  adminAuthController,
  authController,
} from '../../controllers/auth/authentication.module';

const route = Router();

route.post('/create', validate(createUserValidator), (req, res, next) => {
  authController.create(req, res, next);
});

route.post(
  '/verify-account',
  validate(verifyPatientEmailValidator),
  (req, res, next) => {
    authController.verifyAccount(req, res, next);
  },
);

route.post(
  '/validate-invite-code',
  validate(validateInviteCode),
  (req, res, next) => {
    authController.validateInviteCode(req, res, next);
  },
);

route.post('/login', validate(LoginValidator), (req, res, next) => {
  authController.login(req, res, next);
});

route.post(
  '/regenerate-access-token',
  validate(RegenerateAccessToken),
  (req, res, next) => {
    authController.regenerateAccessToken(req, res, next);
  },
);

route.post(
  '/resend-otp',
  validate(ResendPatientEmailVerificationValidator),
  (req, res, next) => {
    authController.resendOtp(req, res, next);
  },
);

route.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    authController.passwordReset(req, res, next);
  },
);

route.post(
  '/reset-password',
  validate(ResetPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    authController.resetPassword(req, res, next);
  },
);

route.post(
  '/admin/create',
  validate(createAdminValidator),
  (req, res, next) => {
    adminAuthController.create(req, res, next);
  },
);

route.post(
  '/admin/verify-account',
  validate(verifyPatientEmailValidator),
  (req, res, next) => {
    adminAuthController.verifyEmail(req, res, next);
  },
);

route.post('/admin/login', validate(AdminLoginValidator), (req, res, next) => {
  adminAuthController.login(req, res, next);
});

route.post(
  '/admin/regenerate-access-token',
  validate(RegenerateAccessToken),
  (req, res, next) => {
    adminAuthController.regenerateAccessToken(req, res, next);
  },
);

route.post(
  '/admin/resend-otp',
  validate(resendOtpValidator),
  (req, res, next) => {
    adminAuthController.resendOtp(req, res, next);
  },
);

route.post(
  '/admin/forgot-password',
  validate(forgotPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    adminAuthController.passwordReset(req, res, next);
  },
);

route.post(
  '/admin/reset-password',
  validate(ResetPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    adminAuthController.resetPassword(req, res, next);
  },
);

export default route;
