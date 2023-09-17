/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import AppException from '../../../exceptions/AppException';
import httpStatus from 'http-status';
import HelperClass from '../../../utils/helper';
import config from '../../../../config/default';
import log from '../../../logging/logger';
import moment from 'moment';
import { ACCOUNT_STATUS, ADMIN_ROLE } from '../../../../config/constants';
import EmailService from '../../../services/email.service';
import AuthService from '../../../services/auth.service';
import AdminService from '../../../services/admin.service';
import EncryptionService from '../../../services/encryption.service';
import Admin from '../../../database/models/admin.model';
import SendChamp from '../../../services/sendchamp/index';
import { JwtPayload } from 'jsonwebtoken';
import TokenService from '../../../services/token.service';
const sendChamp = new SendChamp({
  mode: config.sendChamp.mode,
  publicKey: config.sendChamp.apiKey,
});
const emailService = new EmailService();

export default class AdminAuth {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly encryptionService: EncryptionService,
    private readonly tokenService: TokenService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
        ? req.body.phoneNumber
        : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;

      const emailTaken = await this.adminService.getOne(Admin, {
        email: req.body.email,
      });
      delete req.body.confirmPassword;
      const phoneNumberTaken = await this.adminService.getOne(Admin, {
        phoneNumber: req.body.phoneNumber,
      });
      if (emailTaken) throw new Error(`Oops!, ${emailTaken.email} is taken`);
      if (phoneNumberTaken)
        throw new Error(`Oops!, ${phoneNumberTaken.phoneNumber} is taken`);
      req.body.role = ADMIN_ROLE.ENGINEER;
      req.body.accountStatus = {
        status: ACCOUNT_STATUS.CONFIRMED,
        reason: 'Account created',
        updatedAt: moment().toDate(),
      };
      /** if admin does not exist create the admin using the admin service */
      req.body.password = await this.encryptionService.hashPassword(
        req.body.password,
      );
      // const OTP_CODE = HelperClass.generateRandomChar(6, 'num');
      // const hashedToken = createHash('sha512')
      //   .update(String(OTP_CODE))
      //   .digest('hex');

      // req.body.emailVerificationToken = hashedToken;
      // req.body.emailVerificationTokenExpiry = moment()
      //   .add('1', 'day')
      //   .utc()
      //   .toDate();

      const data = await this.authService.create<Admin>(req.body, Admin);
      /** Setup admin wallet */
      //   await this.CaesarService.setupAccount<Admin>(data, {});
      /** Send email verification to Admin */
      // await emailService._sendPatientEmailVerificationEmail(
      //   `${data.firstName} ${data.lastName}`,
      //   data.email,
      //   OTP_CODE,
      // );
      return res.status(httpStatus.OK).json({
        status: 'success',
        message: `Account created successfully`,
        admin: data,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const adminExists = await Admin.findOne({
        email: req.body.email,
      }).select('+password');

      if (
        !adminExists ||
        !(await this.encryptionService.comparePassword(
          adminExists.password,
          req.body.password,
        ))
      )
        throw new Error(`Oops!, invalid email or password`);
      if (adminExists.accountStatus.status !== ACCOUNT_STATUS.CONFIRMED)
        throw Error('Oops! you cant login');
      const token = await this.authService.login(adminExists as any);

      return res
        .status(httpStatus.ACCEPTED)
        .json({ admin: adminExists, token });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        log.error(err);
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async regenerateAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const decodeToken = await this.tokenService.verifyToken(
        req.body.refreshToken,
      );
      const { sub }: string | JwtPayload = decodeToken;
      const admin = await this.adminService.getOne(Admin, {
        id: sub as string,
      });
      const accessToken = await this.authService.regenerateAccessToken({
        id: admin.id,
        email: admin.email,
      });
      if (!accessToken || accessToken.trim() === '')
        return next(
          new AppException(
            'Oops! Refresh token expired.',
            httpStatus.FORBIDDEN,
          ),
        );
      return res.status(httpStatus.OK).json({ status: 'success', accessToken });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await this.adminService.getOne(Admin, {
        email: req.body.email,
      });
      if (!admin)
        next(
          new AppException('Oops!, admin does not exist', httpStatus.NOT_FOUND),
        );
      if (admin.isEmailVerified === true)
        new Error(`Oops!, email has already been verified`);
      await this.authService.resendOtp<Admin>(admin as any, Admin);
      return res.status(httpStatus.NO_CONTENT).send();
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async passwordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const adminExists = await this.adminService.getOne(Admin, {
        email: req.body.email,
      });
      if (!adminExists) throw new Error(`Oops! admin does not exist`);

      const token = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(token);

      const updateBody: Pick<Admin, 'resetToken' | 'resetTokenExpiresAt'> = {
        resetToken: hashedToken,
        resetTokenExpiresAt: moment().add(12, 'hours').utc().toDate(),
      };

      await this.adminService.update<Admin>(
        Admin,
        { _id: adminExists.id },
        updateBody,
      );

      await emailService._sendPatientPasswordResetInstructionEmail(
        `${adminExists.firstName} ${adminExists.lastName}`,
        adminExists.email,
        token,
      );
      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Password reset instruction sent successfully',
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async sendAdminPasswordResetOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
        ? req.body.phoneNumber
        : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;
      const adminExists = await this.adminService.getOne<Admin>(Admin, {
        phoneNumber: req.body.phoneNumber,
      });
      if (!adminExists)
        return next(
          new AppException('Oops! admin does not exist', httpStatus.NOT_FOUND),
        );
      const otp = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(otp);

      const updateBody: Pick<Admin, 'resetToken' | 'resetTokenExpiresAt'> = {
        resetToken: hashedToken,
        resetTokenExpiresAt: moment().add(12, 'hours').utc().toDate(),
      };

      await this.adminService.update<Admin>(Admin, adminExists.id, updateBody);
      if (config.env === 'production') {
        const otp = sendChamp.VERIFICATION;
        const options = {
          channel: 'sms' as const,
          sender: config.sendChamp.senderName as string,
          token_type: 'numeric' as const,
          token_length: 6,
          expiration_time: 1,
          customer_mobile_number: adminExists.phoneNumber,
          meta_data: {
            first_name: adminExists.firstName,
            last_name: adminExists.lastName,
          },
          token: HelperClass.generateRandomChar(6, 'num'),
        };
        await otp.sendOTP(options);

        return res.status(httpStatus.OK).json({
          status: 'success',
          message: 'OTP sent successfully',
        });
      }

      return res.status(httpStatus.OK).json({
        status: 'success',
        data: {
          message:
            'For testing purposes, OTP wont be sent to your phone number, below is the OTP for resetting password',
          token: otp,
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const hashedToken = await this.encryptionService.hashString(
        req.body.token,
      );
      const admin: Admin = await this.adminService.getOne<Admin>(Admin, {
        resetToken: hashedToken,
      });
      if (!admin) throw new Error(`Oops!, invalid otp`);
      if (admin.resetTokenExpiresAt < moment().utc().toDate())
        throw new Error(`Oops!, your token has expired`);
      const hashedPassword = await this.encryptionService.hashPassword(
        req.body.password,
      );
      const updateBody: Pick<
        Admin,
        'password' | 'resetToken' | 'resetTokenExpiresAt'
      > = {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      };
      await this.adminService.update<Admin>(
        Admin,
        { _id: admin.id },
        updateBody,
      );
      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Password reset was successful',
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      /**
       * Check if the hashed token sent to the admin has not being tampered with
       * Check if the token is the same with the one stores in the database
       * check if the email has not being verified
       * check if the token has expired
       * set emailVerificationToken and emailVerificationTokenExpiry field to null
       */
      const _hashedEmailToken: string = await this.encryptionService.hashString(
        req.body.otp,
      );
      const admin = await this.adminService.getOne<Admin>(Admin, {
        isEmailVerified: false,
        emailVerificationToken: _hashedEmailToken,
      });
      if (!admin) throw new Error(`Oops!, invalid otp`);
      if (
        admin.emailVerificationTokenExpiry <
        moment().utc().startOf('day').toDate()
      )
        throw new Error(`Oops!, your token has expired`);
      const data: Pick<
        Admin,
        | 'emailVerifiedAt'
        | 'isEmailVerified'
        | 'emailVerificationToken'
        | 'emailVerificationTokenExpiry'
      > = {
        isEmailVerified: true,
        emailVerifiedAt: moment().utc().toDate(),
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      };
      Object.assign(data, {
        accountStatus: { status: ACCOUNT_STATUS.CONFIRMED },
      });
      await this.adminService.update<Admin>(Admin, { _id: admin.id }, data);
      return res.status(httpStatus.OK).json({
        status: `success`,
        message: `Your email: ${admin.email} has been verified`,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }
}
