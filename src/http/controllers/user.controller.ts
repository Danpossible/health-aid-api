/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import AppException from '../../exceptions/AppException';
import { RequestType } from '../middlewares/auth.middleware';
import pick from '../../utils/pick';
import HelperClass from '../../utils/helper';
import { UploadApiResponse } from 'cloudinary';
import UserService from '../../services/patient.service';
import NotificationService from '../../services/notification.service';
import { deleteFile, uploadBase64File } from '../../services/file.service';
import HealthWorker from '../../database/models/health_worker.model';
import { PORTFOLIO } from '../../../config/constants';
import Patient from '../../database/models/patient.model';

export default class UserController {
  constructor(private readonly userService: UserService) {}
  async getAllPatients(req: RequestType, res: Response, next: NextFunction) {
    try {
      const options = pick(req.query, ['limit', 'page', 'populate', 'orderBy']);
      const filter = pick(req.query, ['accountStatus', 'portfolio']);
      if (req.query.search) {
        Object.assign(filter, {
          $or: [
            { firstName: { $regex: req.query.search, $options: 'i' } },
            { lastName: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        });
      }

      const patient = await this.userService.getAllPatients(filter, options);
      return res.status(httpStatus.OK).json({
        status: 'success',
        patient,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getMyProfile(req: RequestType, res: Response, next: NextFunction) {
    try {
      let me: Patient | HealthWorker;
      me = await this.userService.getPatientById(req.user.id, true);
      if (!me) {
        me = await this.userService.getOne(HealthWorker, {
          _id: req.user.id,
        });
        if (!me) throw new Error('User not found');
      }

      return res.status(httpStatus.OK).json({
        status: 'success',
        me,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async updateMyProfile(req: RequestType, res: Response, next: NextFunction) {
    try {
      if (req.body.avatar) {
        if (req.user.avatar) {
          await deleteFile(req.user.avatar.publicId);
        }
        const { secure_url, public_id } = (await uploadBase64File(
          req.body.avatar,
          'patient_avatar',
          HelperClass.generateRandomChar(9),
        )) as UploadApiResponse;
        req.body.avatar = { url: secure_url, publicId: public_id };
      }
      let me;
      req.user.portfolio === PORTFOLIO.PATIENT
        ? (me = await this.userService.updatePatientById(req.user.id, req.body))
        : (me = await this.userService.update(
            HealthWorker,
            { _id: req.user.id },
            req.body,
          ));
      return res.status(httpStatus.OK).json({
        status: 'success',
        me,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async uploadAvatar(req: RequestType, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const { secure_url, public_id } = await uploadBase64File(
        file.path,
        'Patient_avatar',
        HelperClass.generateRandomChar(9),
      );
      let me;
      req.user.portfolio === PORTFOLIO.PATIENT
        ? (me = await this.userService.updatePatientById(req.user.id, {
            avatar: { url: secure_url, publicId: public_id },
          }))
        : (me = await this.userService.update(
            HealthWorker,
            { _id: req.user.id },
            {
              avatar: { url: secure_url, publicId: public_id },
            },
          ));
      return res.status(httpStatus.OK).json({
        status: 'success',
        me,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async getPatientProfile(req: RequestType, res: Response, next: NextFunction) {
    try {
      let user: Patient | HealthWorker;
      user = await this.userService.getOne(Patient, {
        _id: req.params.userId,
      });
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          _id: req.params.userId,
        });
        if (!user) throw new Error('User not found');
      }
      return res.status(httpStatus.OK).json({
        status: 'success',
        user,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async searchPatients(req: RequestType, res: Response, next: NextFunction) {
    try {
      const filter = {};
      Object.assign(filter, {
        $or: [
          { firstName: { $regex: req.query.q, $options: 'i' } },
          { lastName: { $regex: req.query.q, $options: 'i' } },
          { systemCode: { $regex: req.query.q, $options: 'i' } },
        ],
      });
      const user = await this.userService.searchPatients(filter);
      return res.status(httpStatus.OK).json({
        status: 'success',
        user,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async savePatientDeviceInfo(
    req: RequestType,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await this.userService.savePatientDeviceInfo(
        req.body,
        req.user,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        data,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getNotifications(req: RequestType, res: Response, next: NextFunction) {
    try {
      const filter = pick(req.query, ['Patient']);
      const options = pick(req.query, ['limit', 'page', 'populate', 'orderBy']);
      const data = await NotificationService.getAllNotifications(
        filter,
        options,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        data,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async completeProfile(req: RequestType, res: Response, next: NextFunction) {
    try {
      const uploadDriversLicense = await uploadBase64File(
        req.body.kyc.driversLicense.image,
        'health_workers_kyc',
        HelperClass.generateRandomChar(5),
      );
      req.body.kyc.driversLicense.image = {
        url: uploadDriversLicense.secure_url,
        publicId: uploadDriversLicense.public_id,
      };

      const uploadMedicalLicense = await uploadBase64File(
        req.body.kyc.medicalLicense.image,
        'health_workers_kyc',
        HelperClass.generateRandomChar(5),
      );
      req.body.kyc.medicalLicense.image = {
        url: uploadMedicalLicense.secure_url,
        publicId: uploadMedicalLicense.public_id,
      };

      const uploadMedicalCertificate = await uploadBase64File(
        req.body.kyc.medicalCertificate.image,
        'health_workers_kyc',
        HelperClass.generateRandomChar(5),
      );
      req.body.kyc.medicalCertificate = {
        url: uploadMedicalCertificate.secure_url,
        publicId: uploadMedicalCertificate.public_id,
      };

      const certifications = [];
      for (const cert of req.body.kyc.certifications) {
        const uploadCert = await uploadBase64File(
          cert.image,
          'health_workers_kyc',
          HelperClass.generateRandomChar(5),
        );
        certifications.push({
          name: cert.name,
          image: {
            url: uploadCert.secure_url,
            publicId: uploadCert.public_id,
          },
        });
      }
      req.body.kyc.certifications = certifications;

      const data = await this.userService.update(
        HealthWorker,
        { id: req.body.healthWorker },
        req.body,
      );
      return res.status(httpStatus.OK).json({
        status: 'success',
        data,
      });
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof AppException)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
