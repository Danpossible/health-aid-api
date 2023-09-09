/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import moment from 'moment';
import AuthService from '../../../services/auth.service';
import EncryptionService from '../../../services/encryption.service';
import HelperClass from '../../../utils/helper';
import { ACCOUNT_STATUS, PORTFOLIO } from '../../../../config/constants';
import AppException from '../../../exceptions/AppException';
import Patient from '../../../database/models/patient.model';
// import SendChamp from '../../../services/sendchamp/index';
import HealthWorker from '../../../database/models/health_worker.model';
import EmailService from '../../../services/email.service';
import UserService from '../../../services/patient.service';
// const sendChamp = new SendChamp({
//   mode: config.sendChamp.mode,
//   publicKey: config.sendChamp.apiKey,
// });
export default class PatientAuth {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
        ? req.body.phoneNumber
        : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;

      if (req.body.email) {
        let emailTaken: Patient | HealthWorker;
        emailTaken = await this.userService.getPatientDetail({
          email: req.body.email,
        });
        if (emailTaken) throw new Error(`Oops!, ${emailTaken.email} is taken`);
        emailTaken = await this.userService.getOne(HealthWorker, {
          email: req.body.email,
        });
        if (emailTaken) throw new Error(`Oops!, ${emailTaken.email} is taken`);
      }
      delete req.body.confirmPassword;
      let phoneNumberTaken: Patient | HealthWorker;
      phoneNumberTaken = await this.userService.getPatientDetail({
        phoneNumber: req.body.phoneNumber,
      });
      if (phoneNumberTaken)
        throw new Error(`Oops!, ${phoneNumberTaken.phoneNumber} is taken`);

      phoneNumberTaken = await this.userService.getOne(HealthWorker, {
        phoneNumber: req.body.phoneNumber,
      });
      if (phoneNumberTaken)
        throw new Error(`Oops!, ${phoneNumberTaken.phoneNumber} is taken`);

      // req.body.firstName = HelperClass.titleCase(req.body.firstName);
      // req.body.lastName = HelperClass.titleCase(req.body.lastName);
      req.body.referralCode = HelperClass.generateRandomChar(6, 'upper-num');
      if (req.body.inviteCode) {
        let user: Patient | HealthWorker;
        user = await this.userService.getPatientDetail({
          referralCode: req.body.inviteCode,
        });
        if (!user) {
          user = await this.userService.getOne(HealthWorker, {
            referralCode: req.body.inviteCode,
          });
          if (!user) throw new Error(`Oops!, invalid referral code`);
        }
      }
      req.body.accountStatus = {
        status: ACCOUNT_STATUS.PENDING,
        reason: 'Patient account is pending verification',
      };
      req.body.systemCode = await HelperClass.generateSystemCode<Patient>(
        Patient,
        `${req.body.firstName} ${req.body.lastName}`,
      );
      req.body.password = await this.encryptionService.hashPassword(
        req.body.password,
      );
      /** if Patient does not exist create the Patient using the Patient service */
      const OTP_CODE = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(OTP_CODE);
      req.body.verificationToken = hashedToken;
      req.body.verificationTokenExpiry = moment()
        .add('1', 'day')
        .utc()
        .toDate();
      let patient: Patient | HealthWorker;
      req.body.portfolio === PORTFOLIO.PATIENT
        ? (patient = await this.authService.create<Patient>(req.body, Patient))
        : (patient = await this.authService.create<HealthWorker>(
            req.body,
            HealthWorker,
          ));

      /** Send verification code to Patient */
      // if (config.env === 'production') {
      //   await this.sendOtp({
      //     phoneNumber: Patient.phoneNumber,
      //     firstName: Patient.firstName,
      //     lastName: Patient.lastName,
      //     OTP_CODE,
      //   });

      //   return res.status(httpStatus.OK).json({
      //     status: 'success',
      //     message: 'OTP sent successfully',
      //     Patient,
      //   });
      // }
      await this.emailService._sendPatientEmailVerificationEmail(
        `${HelperClass.upperCase(patient.lastName)} ${HelperClass.capitalCase(
          patient.firstName,
        )}`,
        patient.email,
        OTP_CODE,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        message: `For testing purposes, OTP wont be sent to your phone number, but you can use this OTP -> ${OTP_CODE} to verify your account`,
        patient,
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
      //   ? req.body.phoneNumber
      //   : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;
      let user: Patient | HealthWorker;
      user = await Patient.findOne({
        email: req.body.email,
      }).select('+password');
      if (!user) {
        user = await HealthWorker.findOne({
          email: req.body.email,
        }).select('+password');
        if (!Patient) throw new Error('Oops! invalid login credentials');
      }
      if (
        !(await this.encryptionService.comparePassword(
          user.password,
          req.body.password,
        ))
      )
        throw new Error('Oops! invalid login credentials');

      if (user.accountStatus.status !== ACCOUNT_STATUS.CONFIRMED)
        throw Error('Oops! account is not verified');
      const token = await this.authService.login(
        Patient as unknown as { [key: string]: string },
      );

      user.portfolio === PORTFOLIO.PATIENT
        ? await this.userService.updatePatientById(user.id, {
            pushNotificationId: req.body.pushNotificationId,
          })
        : await this.userService.update(
            HealthWorker,
            { _id: user.id },
            {
              pushNotificationId: req.body.pushNotificationId,
            },
          );
      return res.status(httpStatus.ACCEPTED).json({ user, token });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async regenerateAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      // const Patient = await this.
      const accessToken = await this.authService.regenerateAccessToken<Patient>(
        req.body.refreshToken,
        Patient,
      );
      if (!accessToken || accessToken.trim() === '')
        return next(
          new AppException(
            'Oops! Refresh token expired.',
            httpStatus.FORBIDDEN,
          ),
        );
      return res.status(httpStatus.OK).json({ status: 'success', accessToken });
    } catch (err: any) {
      return next(
        new AppException(err.message, err.status || httpStatus.BAD_REQUEST),
      );
    }
  }

  // private async sendOtp(body: { [key: string]: string }) {
  //   try {
  //     const otp = sendChamp.VERIFICATION;
  //     const options = {
  //       channel: 'sms' as const,
  //       sender: config.sendChamp.senderName as string,
  //       token_type: 'numeric' as const,
  //       token_length: 6,
  //       expiration_time: 1,
  //       customer_mobile_number: body.phoneNumber,
  //       meta_data: {
  //         first_name: body.firstName,
  //         last_name: body.lastName,
  //       },
  //       token: body.OTP_CODE,
  //     };
  //     await otp.sendOTP(options);
  //   } catch (err: unknown) {
  //     log.error(err);
  //     if (err instanceof Error) throw new Error(err.message);
  //   }
  // }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
      //   ? req.body.phoneNumber
      //   : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;
      let patient = await Patient.findOne({
        email: req.body.email,
      });
      if (!patient) {
        patient = await HealthWorker.findOne({
          email: req.body.email,
        });
      }
      if (!patient) throw new Error('Oops! Patient does not exist');
      if (patient.accountStatus.status === ACCOUNT_STATUS.CONFIRMED)
        throw new Error(`Oops!, account has already been verified`);
      const otp = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(otp);

      const updateBody: Pick<
        Patient,
        'verificationToken' | 'verificationTokenExpiry'
      > = {
        verificationToken: hashedToken,
        verificationTokenExpiry: moment().add('10', 'minutes').utc().toDate(),
      };
      await this.userService.updatePatientById(patient.id, updateBody);
      // await this.sendOtp({
      //   phoneNumber: Patient.phoneNumber,
      //   firstName: Patient.firstName,
      //   lastName: Patient.lastName,
      //   otp,
      // });
      await this.emailService._sendPatientEmailVerificationEmail(
        `${HelperClass.upperCase(patient.lastName)} ${patient.firstName}`,
        patient.email,
        otp,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        message: 'OTP sent successfully, please check your phone number',
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const hashedOtp = await this.encryptionService.hashString(req.body.otp);
      let patient = await Patient.findOne({
        verificationToken: hashedOtp,
      });
      if (!patient) {
        patient = await HealthWorker.findOne({
          verificationToken: hashedOtp,
        });
      }
      if (!patient) throw new Error('Oops! Patient does not exist');
      if (patient.verificationTokenExpiry < new Date())
        throw new Error('Oops!, otp has expired');
      patient.verificationToken = null;
      patient.verificationTokenExpiry = null;
      patient.save();
      const token = await this.authService.login(
        Patient as unknown as { [key: string]: string },
      );
      await this.userService.updatePatientById(patient.id, {
        pushNotificationId: req.body.pushNotificationId,
      });
      return res.status(httpStatus.OK).json({
        status: 'success',
        Patient: Patient,
        token,
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async passwordReset(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body.phoneNumber = req.body.phoneNumber.startsWith('+234')
      //   ? req.body.phoneNumber
      //   : `+234${req.body.phoneNumber.replace(/^0+/, '')}`;
      let user: Patient | HealthWorker;
      user = await this.userService.getPatientDetail({
        email: req.body.email,
      });
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          email: req.body.email,
        });
      }
      if (!user) throw new Error('Oops! Patient does not exist');
      const otp = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(otp);
      const updateBody: Pick<
        Patient,
        'passwordResetToken' | 'passwordResetTokenExpiresAt'
      > = {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: moment().add(10, 'minutes').utc().toDate(),
      };
      await this.userService.updatePatientById(user.id, updateBody);
      // if (config.enviroment === 'production') {
      //   await this.sendOtp({
      //     phoneNumber: Patient.phoneNumber,
      //     firstName: Patient.firstName,
      //     lastName: Patient.lastName,
      //     otp,
      //   });
      // }
      await this.emailService._sendPatientEmailVerificationEmail(
        `${HelperClass.upperCase(user.lastName)} ${user.firstName}`,
        user.email,
        otp,
      );
      return res.status(httpStatus.OK).json({
        status: `success`,
        message: 'OTP sent successfully',
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const hashedToken = await this.encryptionService.hashString(
        req.body.token,
      );
      let user: Patient | HealthWorker;
      user = await this.userService.getPatientDetail({
        passwordResetToken: hashedToken,
      });
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          passwordResetToken: hashedToken,
        });
      }
      if (!user) throw new Error(`Oops!, invalid otp`);
      if (user.passwordResetTokenExpiresAt < moment().utc().toDate())
        throw new Error(`Oops!, your token has expired`);
      const hashedPassword = await this.encryptionService.hashPassword(
        req.body.password,
      );
      const updateBody: Pick<
        Patient,
        'password' | 'passwordResetToken' | 'passwordResetTokenExpiresAt'
      > = {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      };

      user.portfolio === PORTFOLIO.PATIENT
        ? await this.userService.updatePatientById(user.id, updateBody)
        : await this.userService.update(
            HealthWorker,
            { _id: user.id },
            updateBody,
          );
      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Password reset was successful',
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async validateInviteCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { inviteCode } = req.body;
      let user: Patient | HealthWorker;
      user = await this.userService.getPatientDetail({
        referralCode: inviteCode,
      });
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          referralCode: inviteCode,
        });
      }
      if (!user) throw new Error(`Oops!, invalid otp`);
      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Invite code is valid',
        user: `${user.firstName} ${user.lastName}`,
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async verifyAccount(req: Request, res: Response, next: NextFunction) {
    try {
      /**
       * Check if the hashed token sent to the Patient has not being tampered with
       * Check if the token is the same with the one stores in the database
       * check if the email has not being verified
       * check if the token has expired
       * set emailVerificationToken and emailVerificationTokenExpiry field to null
       */

      const _hashedEmailToken: string = await this.encryptionService.hashString(
        req.body.otp,
      );
      let user: Patient | HealthWorker;
      user = await this.userService.getPatientDetail({
        'accountStatus.status': ACCOUNT_STATUS.PENDING,
        verificationToken: _hashedEmailToken,
      } as Record<string, unknown>);
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          'accountStatus.status': ACCOUNT_STATUS.PENDING,
          verificationToken: _hashedEmailToken,
        } as Record<string, unknown>);
        if (!user)
          throw new Error(
            `Oops!, your account has already been verified or your otp is invalid`,
          );
      }

      if (user.verificationTokenExpiry < moment().utc().startOf('day').toDate())
        throw new Error(`Oops!, your otp has expired`);
      const data: Pick<
        Patient | HealthWorker,
        | 'verifiedAt'
        | 'verificationToken'
        | 'verificationTokenExpiry'
        | 'accountStatus'
      > = {
        verifiedAt: moment().utc().toDate(),
        verificationToken: null,
        verificationTokenExpiry: null,
        accountStatus: {
          status: ACCOUNT_STATUS.CONFIRMED,
          reason: `Your account has been verified`,
        },
      };
      user.portfolio === PORTFOLIO.PATIENT
        ? await this.userService.updatePatientById(user.id, data)
        : await this.userService.update(HealthWorker, { _id: user.id }, data);
      return res.status(httpStatus.OK).json({
        status: `success`,
        message: `Your account has been verified`,
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }
}
