/* eslint-disable no-param-reassign */

// WIP - Work in progress
import { Schema, model } from 'mongoose';
import paginate, { Pagination } from '../plugins/paginate.plugin';
import toJSON from '../plugins/toJson.plugin';
import {
  GENDER,
  PORTFOLIO,
  ACCOUNT_STATUS,
  HEALTH_WORKER_TYPE,
  AVAILABILITY,
} from '../../../config/constants';
import auditableFields from '../plugins/auditableFields.plugin';
import { HealthWorker } from '../../../index';
import HelperClass from '../../utils/helper';

const HealthWorkerSchema = new Schema<HealthWorker>(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
      // set: function (firstName: string) {
      //   return firstName.toLowerCase();
      // },
      get: function (firstName: string) {
        return HelperClass.titleCase(firstName);
      },
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      // set: function (lastName: string) {
      //   return lastName.toLowerCase();
      // },
      get: function (lastName: string) {
        return lastName.toUpperCase();
      },
    },
    middleName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    portfolio: {
      type: String,
      enum: Object.values(PORTFOLIO),
    },
    healthWorkerType: {
      type: String,
      enum: Object.values(HEALTH_WORKER_TYPE),
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    availability: { type: String, enum: Object.values(AVAILABILITY) , default: AVAILABILITY.AVAILABLE_IN_PERSON_AND_REMOTE },
    verifiedAt: Date,
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetToken: String,
    resetTokenExpiresAt: Date,
    pushNotificationId: String,
    allowPushNotification: {
      type: Boolean,
      default: true,
    },
    appVersion: String,
    gender: {
      type: String,
      enum: Object.values(GENDER),
    },
    avatar: String,
    referralCode: String,
    inviteCode: String,
    deviceInfo: [Map],
    accountStatus: {
      status: {
        type: String,
        enum: Object.values(ACCOUNT_STATUS),
        default: ACCOUNT_STATUS.PENDING,
      },
      reason: String,
    },
    specialization: [String],
    experience: [String],
    systemCode: String,
    location: {
      latitude: Number,
      longitude: Number,
      state: String,
      country: { type: String, default: 'Nigeria' },
      address: String,
    },
    homeLocation: {
      latitude: Number,
      longitude: Number,
      state: String,
      country: { type: String, default: 'Nigeria' },
      address: String,
    },
    kyc: {
      driversLicense: {
        typeId: String,
        number: String,
        image: String,
      },
      medicalLicense: {
        number: String,
        image: String,
      },
      medicalCertificate: {
        url: String,
        publicId: String,
      },
      certifications: [
        {
          name: String,
          image: String,
        },
      ],
    },
    lastLogin: Date,
    ...auditableFields,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret._id;
        delete ret.resetToken;
        delete ret.resetTokenExpiresAt;
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationTokenExpiry;
        return ret;
      },
    },
  },
);

// add plugin that converts mongoose to json
HealthWorkerSchema.plugin(toJSON);
HealthWorkerSchema.plugin(paginate);

/**
 * @typedef HealthWorker
 */
const HealthWorker: Pagination<HealthWorker> = model<
  HealthWorker,
  Pagination<HealthWorker>
>('HealthWorker', HealthWorkerSchema);

export default HealthWorker;
