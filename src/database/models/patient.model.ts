/* eslint-disable no-param-reassign */
import { Schema, model } from 'mongoose';
import paginate, { Pagination } from '../plugins/paginate.plugin';
import toJSON from '../plugins/toJson.plugin';
import { GENDER, PORTFOLIO, ACCOUNT_STATUS } from '../../../config/constants';
import auditableFields from '../plugins/auditableFields.plugin';
import { Patient } from '../../../index';
import HelperClass from '../../utils/helper';

const patientSchema = new Schema<Patient>(
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
    password: {
      type: String,
      required: false,
      trim: true,
    },
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
    location: {
      latitude: Number,
      longitude: Number,
      state: String,
      country: { type: String, default: 'Nigeria' },
      address: String,
    },
    // dob: {
    //   type: Date,
    //   required: false,
    // },
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
    systemCode: String,
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
        delete ret.verificationTokenExpiry;
        return ret;
      },
    },
  },
);

// add plugin that converts mongoose to json
patientSchema.plugin(toJSON);
patientSchema.plugin(paginate);

/**
 * @typedef Patient
 */
const Patient: Pagination<Patient> = model<Patient, Pagination<Patient>>(
  'Patient',
  patientSchema,
);

export default Patient;
