/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import AppException from '../../exceptions/AppException';
import httpStatus from 'http-status';

export type RequestType = {
  [prop: string]: any;
} & Request;

export const restrictAccessTo =
  (...portfolios: string[]) =>
  (req: RequestType, _res: Response, next: NextFunction) => {
    if (!portfolios.includes(req.user.portfolio)) {
      return next(
        new AppException(
          `Oops! you don't have the privilege to perform this action`,
          httpStatus.FORBIDDEN,
        ),
      );
    }

    next();
  };

export const restrictAdminAccessTo =
  (...roles: string[]) =>
  (req: RequestType, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new AppException(
          `Oops! you don't have the privilege to perform this action`,
          httpStatus.FORBIDDEN,
        ),
      );
    }

    next();
  };
