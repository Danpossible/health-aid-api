/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from 'express';
import { RequestType } from '../middlewares/auth.middleware';
import PaymentService from '../../services/payment.service';
import config from '../../../config/default';
import UserService from '../../services/patient.service';
import EmailService from '../../services/email.service';
import AppException from '../../exceptions/AppException';
import {
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
  TRANSACTION_STATUS,
  PORTFOLIO,
  NOTIFICATION_TYPES,
} from '../../../config/constants';
import httpStatus from 'http-status';
import HelperClass from '../../utils/helper';
import pick from '../../utils/pick';
import moment from 'moment';
import { Document } from 'mongoose';
import EncryptionService from '../../services/encryption.service';
import NotificationService from '../../services/notification.service';
import User from '../../database/models/patient.model';

import TransactionLog from '../../database/models/wallet/TransactionLog.model';
import HealthWorker from '../../database/models/health_worker.model';

// type ObjT = {
//   [key: string]: {
//     name: string;
//     mobileOperatorCode: string;
//     services: object[];
//   };
// };

export default class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /** Credit users account after money was sent to their account number */
  async creditAccount(req: RequestType, res: Response) {
    const { reference } = req.params;
    let data: any = {};
    if (req.query && req.query.statusCode === '0') {
      data = { ...req.query };
    } else if (req.body && req.body.statusCode === '0') data = { ...req.body };

    data.idempotentKey = data.transactionReference;
    const proceed = await this.paymentService.controlTransaction(data);
    if (!proceed)
      return res
        .status(200)
        .json({ status: 'success', message: 'Transaction already processed' });

    const errorTracker = [
      `<strong>Account credit process for user account. Reference: ${reference}</strong><br>`,
      `Credit request initiated for TrxId: ${data.transactionReference}`,
    ];

    try {
      const accountInfo = await this.paymentService.queryAccountInfo({
        walletReference: reference,
      });
      const initiator_id =
        accountInfo.walletFor === PORTFOLIO.HEALTH_WORKER
          ? accountInfo.patient
          : accountInfo.healthWorker;
      errorTracker.push(
        `Account info retrieved successfully for user ${initiator_id}`,
      );

      const transactionDump = await this.paymentService.createTransactionDump({
        data: data,
        user: initiator_id as string,
      });

      errorTracker.push(
        `Transaction data dumped successfully. DumpId ${transactionDump.id.toString()}`,
      );
      data.amount = data.amount.split(',').join('');
      errorTracker.push(
        `Transaction amount converted to number successfully (${data.amount})`,
      );

      const updatedBalance = Number(
        (accountInfo.availableBalance + Number(data.amount)).toFixed(2),
      );
      errorTracker.push(
        `New balance calculated successfully (${updatedBalance})`,
      );
      // Confirm that there is no prior log of this particular transaction
      const getTransactions = (await this.paymentService.getTransactions(
        {
          reference: data.transactionReference,
        },
        {},
        true,
      )) as (Document<unknown, any, TransactionLog> & TransactionLog)[];

      if (getTransactions.length > 0) {
        errorTracker.push(`Transaction previous log check returns true`);
        return res.send({ status: 'SUCCESS', message: 'Already logged' });
      }
      const assignee =
        accountInfo.walletFor === PORTFOLIO.HEALTH_WORKER
          ? { patient: initiator_id }
          : { healthWorker: initiator_id };

      await this.paymentService.updateAvailableBalance(
        updatedBalance,
        assignee,
      );

      let charge = Number(
        (
          (Number(config.paymentData.depositCharge) / 100) *
          data.amount
        ).toFixed(2),
      );
      charge = charge > 500 ? 500 : charge;
      data.amount = data.amount - charge;
      const transaction = await this.paymentService.createTransactionLog({
        ...assignee,
        amount: Number(data.amount),
        reference: data.transactionReference,
        type: TRANSACTION_TYPES.CREDIT,
        source: TRANSACTION_SOURCES.BANK_TRANSFER,
        transactionDump: transactionDump.id,
        status: TRANSACTION_STATUS.SUCCESSFUL,
        balanceAfterTransaction: updatedBalance,
        fees: charge,
        meta: {
          payerName: data.payerDetails.payerName as string,
          bankName: data.payerDetails.payerBankName as string,
          paymentReferenceNumber: data.payerDetails
            .paymentReferenceNumber as string,
          fundingPaymentReference: data.fundingPaymentReference as string,
          accountNumber: accountInfo.walletNumber,
          accountName: accountInfo.walletName,
          transactionType: 'Deposit',
        },
      });

      await this.paymentService.createSinntsEarnings({
        ...assignee,
        source: TRANSACTION_SOURCES.BANK_TRANSFER,
        amount: Number(data.amount),
        charge,
        profit: 0,
        transaction: transaction.id,
        amountSpent: 0,
      });

      errorTracker.push(`Transaction logged successfully for user`);
      const message = `NGN${data.amount} was credited to your account (${data.payerDetails.payerName}/${data.payerDetails.payerBankName})`;

      let user = await this.userService.getPatientById(initiator_id as string);
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          _id: initiator_id as string,
        });
        if (!user) throw new Error('User not found');
      }

      this.emailService.transactionNotificationEmail(
        user.email,
        user.firstName,
        message,
      );
      errorTracker.push(`Credit notification email sent`);

      errorTracker.push(`All required step completed successfully`);

      this.emailService.sendPaymentTrackingEmail(errorTracker.join(' <br> '));

      NotificationService.createNotification({
        ...assignee,
        message,
        title: 'Transaction Notification',
        for:
          user.portfolio === PORTFOLIO.HEALTH_WORKER
            ? PORTFOLIO.HEALTH_WORKER
            : PORTFOLIO.PATIENT,
        type: NOTIFICATION_TYPES.TRANSACTION_NOTIFICATION,
      });

      // mixPanel(EVENTS.DEPOSIT, transaction);
      return res.send({ status: 'SUCCESS' });
    } catch (err: any) {
      this.paymentService.logError({ stackTrace: errorTracker.join(' <br> ') });
      this.emailService.sendPaymentTrackingEmail(errorTracker.join(' <br> '));
      return res.send({ status: 'FAILED' });
    }
  }

  /** Perform in app transfers */
  async inAppTransfer(req: RequestType, res: Response, next: NextFunction) {
    const accountInfo = await this.paymentService.queryAccountInfoByUser(
      req.user.id,
    );
    const proceed = await this.paymentService.controlTransaction(req.body);
    if (!proceed)
      return next(
        new AppException(
          'Duplicate transaction, withdrawal already initialized',
          httpStatus.BAD_REQUEST,
        ),
      );

    if (!accountInfo)
      return next(
        new AppException(
          'You cannot make transfers until your account is fully setup',
          httpStatus.FORBIDDEN,
        ),
      );

    if (req.body.amount <= accountInfo.availableBalance) {
      const updatedBalance = Number(
        (accountInfo.availableBalance - Number(req.body.amount)).toFixed(2),
      );
      const withdrawResponse = await this.paymentService.transferMoney(
        req.body,
        req.user,
      );
      await this.paymentService.updateAvailableBalance(updatedBalance, {
        walletNumber: accountInfo.walletNumber,
      });
      const assignee =
        accountInfo.walletFor === PORTFOLIO.HEALTH_WORKER
          ? { patient: accountInfo.patient }
          : { healthWorker: accountInfo.healthWorker };
      const transactionDump = await this.paymentService.createTransactionDump({
        data: withdrawResponse,
        ...assignee,
      });
      // Store transaction
      const transaction = await this.paymentService.createTransactionLog({
        ...assignee,
        source: TRANSACTION_SOURCES.AVAILABLE_BALANCE,
        type: TRANSACTION_TYPES.DEBIT,
        amount: Number(req.body.amount),
        purpose: req.body.purpose || null,
        transactionDump: transactionDump.id,
        reference: withdrawResponse.reference,
        status: TRANSACTION_STATUS.SUCCESSFUL,
        balanceAfterTransaction: updatedBalance,
        meta: {
          accountNumber: req.body.accountNumber,
          accountName: withdrawResponse.walletHolderName,
          currency: withdrawResponse.currency,
          fee: withdrawResponse.fee,
          message: withdrawResponse.message,
          reference: withdrawResponse.reference,
          transactionType: 'Transfer',
        },
      });

      const message = `${req.body.amount} RCOIN was debited from your account to (${withdrawResponse.walletHolderName}/${withdrawResponse.walletNumber})`;
      let user = await this.userService.getPatientById(
        accountInfo.patient as string,
      );
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          _id: accountInfo.healthWorker as string,
        });
        if (!user) throw new Error('User not found');
      }

      this.emailService.transactionNotificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        message,
      );

      NotificationService.createNotification({
        ...assignee,
        title: 'Transaction Notification',
        message,
        for: user.portfolio,
        type: NOTIFICATION_TYPES.TRANSACTION_NOTIFICATION,
      });
      res.send(transaction);
    } else
      return next(
        new AppException(
          `Oops! you don't have enough funds to perform this transaction`,
          httpStatus.BAD_REQUEST,
        ),
      );
  }

  async getAccountInfo(req: RequestType, res: Response, next: NextFunction) {
    try {
      const accountInfo = await this.paymentService.queryAccountInfoByUser(
        req.user.id,
      );
      if (!accountInfo) {
        const newAccountInfo = await this.paymentService.setupAccount<User>(
          req.user,
          {},
        );
        return res.status(httpStatus.CREATED).json(newAccountInfo);
      }
      return res.status(httpStatus.OK).json(accountInfo);
    } catch (err: any) {
      return next(
        new AppException(err.message, err.status || httpStatus.BAD_REQUEST),
      );
    }
  }

  async deleteAccount(req: RequestType, res: Response, next: NextFunction) {
    try {
      const accountInfo = await this.paymentService.queryAccountInfoByUser(
        req.user.id,
      );
      if (!accountInfo) {
        return next(
          new AppException('Account does not exist', httpStatus.BAD_REQUEST),
        );
      }
      await this.paymentService.deleteAccount({
        user: req.user.id,
        walletReference: accountInfo.walletReference,
        walletFor: accountInfo.walletFor,
      });
      return res.status(httpStatus.OK).json({ message: 'Account deleted' });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async withdrawMoney(req: RequestType, res: Response, next: NextFunction) {
    try {
      const accountInfo = await this.paymentService.queryAccountInfoByUser(
        req.user.id,
      );
      const assignee =
        req.user.portfolio === PORTFOLIO.HEALTH_WORKER
          ? { patient: req.user.id }
          : { healthWorker: req.user.id };
      const proceed = await this.paymentService.controlTransaction(req.body);
      if (!proceed)
        throw new Error(
          'Duplicate transaction, withdrawal already initialized',
        );
      if (!accountInfo)
        throw new Error(
          'You cannot make transfers until your account is fully setup',
        );
      if (accountInfo.locked === true)
        throw new Error(
          'Oops!, your account is locked, please contact support',
        );
      let charge = Number(
        Number(config.paymentData.withdrawalCharge).toFixed(2),
      );

      if (Number(req.body.amount) + charge > accountInfo.availableBalance)
        throw new Error(
          `Oops! you don't have enough funds ${
            Number(req.body.amount) + charge
          } to perform this transaction`,
        );

      const processingCost = Number(
        config.paymentData.withdrawalProcessingCost,
      );
      const profit = charge - processingCost;
      const updatedBalance = Number(
        (
          accountInfo.availableBalance -
          Number(req.body.amount) -
          charge
        ).toFixed(2),
      );
      const withdrawResponse = await this.paymentService.withdrawMoney(
        req.body,
        req.user,
      );
      charge = withdrawResponse.fee && withdrawResponse.fee === 0 ? 0 : charge;
      await this.paymentService.updateAvailableBalance(
        updatedBalance - charge,
        assignee,
      );
      const transactionDump = await this.paymentService.createTransactionDump({
        data: withdrawResponse,
        ...assignee,
      });
      // Store transaction
      const transaction = await this.paymentService.createTransactionLog({
        ...assignee,
        source: TRANSACTION_SOURCES.AVAILABLE_BALANCE,
        type: TRANSACTION_TYPES.DEBIT,
        amount: Number((Number(req.body.amount) + charge).toFixed(2)),
        fees: charge,
        purpose: req.body.purpose || null,
        transactionDump: transactionDump.id,
        reference: withdrawResponse?.reference,
        status: TRANSACTION_STATUS.SUCCESSFUL,
        balanceAfterTransaction: updatedBalance,
        meta: {
          accountNumber: req.body.accountNumber,
          currency: withdrawResponse.currency,
          fee: charge,
          message: withdrawResponse.message,
          reference: withdrawResponse?.reference,
          transactionType: 'Withdrawal',
        },
      });

      await this.paymentService.createSinntsEarnings({
        ...assignee,
        source: TRANSACTION_SOURCES.AVAILABLE_BALANCE,
        amount: Number(req.body.amount),
        charge,
        profit: withdrawResponse.fee && withdrawResponse.fee === 0 ? 0 : profit,
        transaction: transaction.id,
        amountSpent:
          withdrawResponse.fee && withdrawResponse.fee === 0
            ? 0
            : processingCost,
      });
      const message = `NGN${req.body.amount} was debited from your account to (${req.body.accountNumber})`;
      let user = await this.userService.getPatientById(
        accountInfo.patient as string,
      );
      if (!user) {
        user = await this.userService.getOne(HealthWorker, {
          _id: accountInfo.healthWorker as string,
        });
        if (!user) throw new Error('User not found');
      }

      this.emailService.transactionNotificationEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        message,
      );

      NotificationService.createNotification({
        ...assignee,
        title: 'Transaction Notification',
        message,
        for: user.portfolio,
        type: NOTIFICATION_TYPES.TRANSACTION_NOTIFICATION,
      });
      // mixPanel(EVENTS.WITHDRAW, transaction);
      res.send(transaction);
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async getBankList(_req: RequestType, res: Response, next: NextFunction) {
    try {
      const banks = await this.paymentService.getInAppBankList();
      if (banks.length !== 0) return res.send(banks);
      const bankList = await this.paymentService.getBanks();
      res.send(bankList);
    } catch (err: any) {
      return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async validateAccount(req: RequestType, res: Response, next: NextFunction) {
    try {
      const details = await this.paymentService.validateAccountNumber(req.body);
      res.send(details);
    } catch (err: any) {
      return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async validatewalletNumber(
    req: RequestType,
    res: Response,
    next: NextFunction,
  ) {
    try {
      req.body.walletCode !== undefined
        ? (req.body.walletNumber = req.body.walletCode)
        : null;
      const details = await this.paymentService.validateWalletNumber(
        req.body.walletNumber,
      );
      res.send(details);
    } catch (err: any) {
      return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getTransactions(req: RequestType, res: Response, next: NextFunction) {
    try {
      const filter = pick(req.query, [
        'user',
        'type',
        'source',
        'category',
        'initiator',
      ]);

      if ('type' in filter) {
        filter.type !== 'all' ? filter.type : delete filter.type;
      }
      if ('category' in filter) {
        filter.category !== 'all' ? filter.category : delete filter.category;
      }
      if ('source' in filter) {
        filter.source !== 'all' ? filter.source : delete filter.source;
      }

      let createdAt: object = {};
      if (req.query.startDate && req.query.endDate) {
        createdAt = {
          $gte: moment(req.query.startDate as string).startOf('day'),
          $lte: moment(req.query.endDate as string).endOf('day'),
        };
      } else if (req.query.startDate) {
        createdAt = {
          $gte: moment(req.query.startDate as string).startOf('day'),
        };
      } else if (req.query.endDate) {
        createdAt = { $lte: moment(req.query.endDate as string).endOf('day') };
      }

      if (Object.keys(createdAt).length !== 0)
        Object.assign(filter, { createdAt });

      const options = pick(req.query, ['orderBy', 'limit', 'page', 'populate']);
      const transactions = await this.paymentService.getTransactions(
        filter,
        options,
        req.query.ignorePaginate as unknown as boolean,
        req.user,
      );
      res.status(httpStatus.OK).json({ status: 'success', transactions });
    } catch (err: any) {
      return next(
        new AppException(err.message, err.status || httpStatus.BAD_REQUEST),
      );
    }
  }

  async getTransaction(req: RequestType, res: Response, next: NextFunction) {
    try {
      const transaction = await this.paymentService.getTransactions({
        id: req.params.id,
      });
      res
        .status(httpStatus.OK)
        .json({ status: 'success', transaction: transaction });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error) {
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
      }
    }
  }

  async saveTransactionPin(
    req: RequestType,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { pin } = req.body;
      const account = await this.paymentService.queryAccountInfoByUser(
        req.user.id,
      );
      if (!account) {
        throw new Error('Account not found');
      }
      const hashedPin = await this.encryptionService.hashString(pin);
      account.transactionPin = hashedPin;
      await account.save();
      res.status(httpStatus.OK).json({ status: 'success', account });
    } catch (err: any) {
      return next(
        new AppException(err.message, err.status || httpStatus.BAD_REQUEST),
      );
    }
  }

  async verifyPin(req: RequestType, res: Response, next: NextFunction) {
    try {
      const { pin } = req.body;
      const hashedPin = await this.encryptionService.hashString(pin);
      const account = await this.paymentService.queryAccountInfo({
        transactionPin: hashedPin,
      });
      if (!account) {
        throw new Error('Oops! Invalid pin');
      }
      res.status(httpStatus.OK).json({ status: 'success', isPinValid: true });
    } catch (err: any) {
      return next(
        new AppException(err.message, err.status || httpStatus.BAD_REQUEST),
      );
    }
  }

  async sendPinResetEmail(req: RequestType, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getPatientById(req.user.id);
      if (!user) throw new Error('User not found');
      const token = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(token);
      user.resetToken = hashedToken;
      user.resetTokenExpiresAt = moment().add(10, 'minutes').toDate();
      await user.save();
      await this.emailService.sendTxPinResetEmail(
        `${HelperClass.upperCase(user.lastName)} ${HelperClass.capitalCase(
          user.firstName,
        )}`,
        user.email,
        token,
      );
      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'A reset pin token has been sent to your email address',
      });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async resetPin(req: RequestType, res: Response, next: NextFunction) {
    try {
      const { pin, token } = req.body;
      const hashedToken = await this.encryptionService.hashString(token);
      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpiresAt: { $gte: moment().toDate() },
      });
      if (!user) {
        throw new Error('Invalid or expired token');
      }
      user.resetTokenExpiresAt = undefined;
      user.resetToken = undefined;
      user.save();
      const hashedPin = await this.encryptionService.hashString(pin);
      const account = await this.paymentService.queryAccountInfoByUser(
        req.user.id,
      );
      if (!account) {
        throw new Error('Account not found');
      }
      account.transactionPin = hashedPin;
      await account.save();
      res.status(httpStatus.OK).json({ status: 'success', account });
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
