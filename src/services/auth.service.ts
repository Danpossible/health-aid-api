/* eslint-disable @typescript-eslint/no-explicit-any */

import HelperClass from '../utils/helper';
import moment from 'moment';
import { Model } from 'mongoose';
import EncryptionService from './encryption.service';
import TokenService from './token.service';
import EmailService from './email.service';

export default class AuthService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  async create<T>(createBody: { [key: string]: any }, model: Model<T>) {
    const data = await model.create(createBody);
    return data;
  }

  async login(loginPayload: { [key: string]: string }) {
    const token = await this.tokenService.generateToken(
      loginPayload.id,
      `${loginPayload.firstName} ${loginPayload.lastName}`,
    );

    return token;
  }

  async regenerateAccessToken(data: {
    [key: string]: string;
  }): Promise<string> {
    const { accessToken } = await this.tokenService.generateToken(
      data.id,
      data.email,
    );

    return accessToken;
  }

  async resendOtp<T>(
    actor: { [key: string]: string },
    model: Model<T>,
  ): Promise<void> {
    const otp = HelperClass.generateRandomChar(6, 'num');
    const hashedToken = await this.encryptionService.hashString(otp);

    const updateBody = {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpiry: moment().add('6', 'hours').utc().toDate(),
    };
    const data = await model.findById(actor.id);
    if (!data) {
      throw new Error(`Oops!, data does not exist`);
    }
    Object.assign(data, updateBody);
    await data.save();

    await this.emailService._sendPatientEmailVerificationEmail(
      `${actor.firstName} ${actor.lastName}`,
      actor.email,
      otp,
    );
  }
}
