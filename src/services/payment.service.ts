import Paga from './Paga.service';
import httpStatus from 'http-status';
import AppException from '../exceptions/AppException';
import {
  TRANSACTION_SOURCES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  PORTFOLIO,
  NOTIFICATION_TYPES,
} from '../../config/constants';
import EmailService from './email.service';
import Notification from './notification.service';
import config from '../../config/default';
import { InAppTransfer } from '../../index';
import generateTxRef from '../utils/generateTxRef';
import UserService from './patient.service';
import TransactionLog from '../database/models/wallet/TransactionLog.model';
import Account from '../database/models/wallet/wallet.model';
import mongoose from 'mongoose';
import RegulateTransaction from '../database/models/wallet/RegulateTransaction.model';
import ErrorTracker from '../database/models/wallet/ErrorTracker.model';
import Bank from '../database/models/wallet/Bank.model';
import Patient from '../database/models/patient.model';
import HealthWorker from '../database/models/health_worker.model';
import Wallet from '../database/models/wallet/wallet.model';
import HelperClass from '../utils/helper';
import TransactionDump from '../database/models/wallet/TransactionDump.model';
import HealthAidEarnings from '../database/models/wallet/Earning.model';
import PaystackClient from './paystack/paystack.client';

export default class PaymentService {
  constructor(
    private readonly paga: Paga,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  private async _initPaystackSdk() {
    return new PaystackClient()
      .setApiKey(config.paymentData.paystackSecretKey)
      .build();
  }

  async getTransactions(
    filter: Partial<TransactionLog>,
    options: {
      orderBy?: string;
      page?: string;
      limit?: string;
      populate?: string;
    } = {},
    ignorePaginate = false,
    actor?: Patient | HealthWorker,
  ) {
    if (actor) {
      Object.assign(filter, { user: actor.id });
    }

    const data = ignorePaginate
      ? await TransactionLog.find(filter).sort({ createdAt: 'desc' })
      : await TransactionLog.paginate(filter, options);
    return data;
  }

  async createTransactionLog(data: Partial<TransactionLog>) {
    const transaction = await TransactionLog.create(data);
    return transaction;
  }

  async updateAvailableBalance(balance: number, filter: Partial<Account>) {
    const account = await this.getAccount(filter);
    if (!account) throw new Error(`Account does not exist`);
    Object.assign(account, {
      availableBalance: balance,
    });
    await account.save();
    return account;
  }

  async updateLedgerBalance(balance: number, filter: Partial<Account>) {
    const account = await this.getAccount(filter);
    if (!account) throw new Error(`Account does not exist`);
    Object.assign(account, {
      ledgerBalance: balance,
    });
    await account.save();
    return account;
  }

  async updateReservedBalance(balance: number, filter: Partial<Account>) {
    const account = await this.getAccount(filter);
    if (!account) throw new Error(`Account does not exist`);
    Object.assign(account, {
      reservedBalance: balance,
    });
    await account.save();
    return account;
  }

  async getAccount(
    condition: Partial<Account>,
  ): Promise<mongoose.Document & Account> {
    const account = await Account.findOne(condition);
    return account;
  }

  async queryUsersAccount(filter: Partial<Account>): Promise<Account[]> {
    const account = await Account.find(filter);
    return account;
  }

  async updateAccount(condition: Partial<Account>, data: Partial<Account>) {
    const account = await Account.findOne(condition);
    if (!account) throw new Error(`Account does not exist`);
    Object.assign(account, data);
    await account.save();
    return account;
  }

  async controlTransaction(
    data: Partial<RegulateTransaction>,
  ): Promise<boolean> {
    const exist = await RegulateTransaction.findOne({
      idempotentKey: data.idempotentKey,
    });
    if (exist) return false;
    await RegulateTransaction.create({ idempotentKey: data.idempotentKey });
    return true;
  }

  async queryAccountInfoByUser(user: string) {
    const account = await Account.findOne({ user });
    return account;
  }

  async queryAccountInfo(filter: Partial<Account>) {
    const account = await Account.findOne(filter);
    return account;
  }

  async createTransactionDump(
    createBody: Partial<TransactionDump>,
  ): Promise<TransactionDump> {
    const transactionDump = await TransactionDump.create(createBody);
    return transactionDump;
  }

  async createSinntsEarnings(
    data: Partial<HealthAidEarnings>,
  ): Promise<HealthAidEarnings> {
    const earnings = await HealthAidEarnings.create(data);
    return earnings;
  }

  async logError(data: Partial<ErrorTracker>): Promise<ErrorTracker> {
    const error = await ErrorTracker.create(data);
    return error;
  }

  async withdraw(body: any, actor: Patient | HealthWorker) {
    body.firstName = actor.firstName;
    body.lastName = actor.lastName;
    if (body.bankId === 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA') {
      // Check if account exist on Sinnts
      const userAccount = await this.getAccount({
        walletNumber: body.walletNumber,
        deletedAt: null,
      });
      body.walletNumber = userAccount?.walletNumber;
      if (userAccount) {
        const result = await this.transferMoney(body, actor);
        return result;
      }
    }
    const withdrawal = await this.paga.withdraw(body);
    if (withdrawal.error)
      throw new AppException(withdrawal.message, httpStatus.BAD_REQUEST);
    return withdrawal;
  }

  async updateBalance(
    amount: number,
    filter: Partial<Wallet>,
    balance: 'ledger' | 'available' = 'available',
  ) {
    balance === 'ledger'
      ? await Wallet.updateOne(
          filter,
          {
            'balance.ledger': amount,
            __v: 1,
          },
          { new: true },
        )
      : await Wallet.updateOne(
          filter,
          {
            'balance.available': amount,
            __v: 1,
          },
          { new: true },
        );
  }

  async transferMoney<T extends Patient | HealthWorker>(
    body: Partial<InAppTransfer>,
    actor: T,
  ) {
    const recipient_wallet_info = await this.queryAccountInfo({
      walletNumber: body.walletNumber,
      deletedAt: null,
    });
    if (!recipient_wallet_info) Error('Oops!, wallet does not exist');
    let recipient: Patient | HealthWorker;
    recipient = await this.userService.getPatientById(
      recipient_wallet_info.patient as string,
    );
    if (!recipient) {
      recipient = await this.userService.getOne(HealthWorker, {
        _id: recipient_wallet_info.healthWorker as string,
      });
      if (!recipient) throw new Error('User not found');
    }
    const assignee =
      recipient.portfolio === PORTFOLIO.PATIENT
        ? { patient: recipient.id }
        : { healthWorker: recipient.id };
    const updatedBalance = Number(
      (recipient_wallet_info.balance.available + body.amount).toFixed(2),
    );
    await this.updateBalance(updatedBalance, {
      walletNumber: recipient_wallet_info.walletNumber,
      walletFor: recipient.portfolio,
      __v: recipient_wallet_info.__v,
    });

    const transaction = await this.createTransactionLog({
      ...assignee,
      amount: body.amount,
      balanceAfterTransaction: updatedBalance,
      source: TRANSACTION_SOURCES.USER_TRANSFER,
      type: TRANSACTION_TYPES.CREDIT,
      reference: generateTxRef(32, 'num'),
      purpose:
        body.purpose ||
        `${recipient.firstName} ${recipient.lastName}, your wallet has been credited with ₦${body.amount} by ${actor.firstName} ${actor.lastName}`,
      fees: 0,
      status: TRANSACTION_STATUS.SUCCESSFUL,
      meta: {
        walletNumber: recipient_wallet_info.walletNumber,
        payerName: `${actor.firstName} ${actor.lastName}`,
        payer: actor.id,
        currency: 'NGN',
        fee: 0,
      },
    });

    const message = `Your ${config.appName} wallet was credited with &#8358;${body.amount} by ${actor.firstName} ${actor.lastName}. Your new balance is ${updatedBalance} NGN`;

    await this.emailService.transactionNotificationEmail(
      recipient.email,
      `${recipient.firstName} ${recipient.lastName}`,
      message,
    );
    await Notification.createNotification({
      message,
      ...assignee,
      title: `Wallet Credited`,
      for:
        recipient.portfolio === PORTFOLIO.HEALTH_WORKER
          ? PORTFOLIO.HEALTH_WORKER
          : PORTFOLIO.PATIENT,
      type: NOTIFICATION_TYPES.TRANSACTION_NOTIFICATION,
      priority: 1,
      meta: {
        transaction: transaction.id,
      },
    });

    // if (recipient.pushNotificationId) { }
    return {
      reference: HelperClass.generateRandomChar(32, 'num'),
      walletNumber: recipient_wallet_info.walletNumber,
      email: actor.email,
      walletHolderName: `${recipient.firstName} ${recipient.lastName}`,
      currency: 'NGN',
      fee: 0,
      message,
    };
  }

  async setupAccount<T extends Patient | HealthWorker>(userData: Partial<T>) {
    const paystack = await this._initPaystackSdk();
    const user =
      userData.portfolio === PORTFOLIO.PATIENT
        ? { patient: userData._id, walletFor: PORTFOLIO.PATIENT }
        : {
            healthWorker: userData._id as string,
            walletFor: PORTFOLIO.HEALTH_WORKER,
          };

    // let paystackCustomer = await paystack.getCustomerDetails(userData.email);
    // if (paystackCustomer.error) {
    const paystackCustomer = await paystack.createCustomer({
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phoneNumber,
    });
    if (paystackCustomer.error) throw new Error(paystackCustomer.message);
    // }

    // use the customer details to create a paystack DVA
    const paystackDVA = await paystack.createDVA({
      customer: paystackCustomer.data.customer_code,
      preferred_bank: 'wema-bank',
    });
    if (paystackDVA.error) {
      await Notification.createNotification({
        message: `Could not generate a dedicated bank account for you due to ${
          paystackDVA.errorMessage || paystackDVA.statusMessage
        }. Update your profile and your dedicated bank account will be generated within 24hours`,
        ...user,
        for: userData.portfolio,
        type: NOTIFICATION_TYPES.WALLET_NOTIFICATION,
        title: 'Dedicated Bank Account',
      });
      throw new Error(
        `Could not generate a dedicated bank account for you due to ${
          paystackDVA.errorMessage || paystackDVA.statusMessage
        }. Update your profile to get your dedicated bank account`,
      );
    }

    const object = {
      walletNumber: paystackDVA.data.account_number,
      walletReference: paystackDVA.data.walletReference,
      walletName: paystackDVA.data.account_name,
      walletFor: userData.portfolio,
      bank: {
        name: paystackDVA.data.bank.name,
        slug: paystackDVA.data.bank.slug,
        id: paystackDVA.data.bank.id,
      },
      dvaID: paystackDVA.data.id,
      assignment: {
        integration: paystackDVA.data.assignment.integration,
        assigned_at: paystackDVA.data.assignment.assigned_at,
        assignee_id: paystackDVA.data.assignment.assignee_id,
        expired: paystackDVA.data.assignment.expired,
        account_type: paystackDVA.data.assignment.account_type,
        assignee_type: paystackDVA.data.assignment.assignee_type,
      },
    };

    const createAccount = await Account.create({ ...object, ...user });

    await Notification.createNotification({
      message: `A dedicated account setup for you`,
      user: userData._id as string,
      ...user,
      title: 'Dedicated Bank Account',
      for: userData.portfolio,
      type: NOTIFICATION_TYPES.WALLET_NOTIFICATION,
    });
    await Notification.createNotification({
      message: `You can now fund your ${config.appName} wallet, receive money and send money through your personal bank account`,
      ...user,
      title: 'Dedicated Bank Account',
      for: userData.portfolio,
      type: NOTIFICATION_TYPES.WALLET_NOTIFICATION,
    });
    return createAccount;
  }

  async withdrawMoney(
    body: {
      bankId: string;
      accountNumber: string;
      walletNumber: string;
      amount: number;
    },
    actor: Patient | HealthWorker,
  ) {
    Object.assign(body, {
      firstName: actor.firstName,
      lastName: actor.lastName,
    });
    if (body.bankId === 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA') {
      const userAccount = await this.queryAccountInfo({
        walletNumber: body.walletNumber,
      });
      if (userAccount) {
        const result = await this.transferMoney(body, actor);
        return result;
      }
    }
    const withdrawal = await this.paga.withdraw(body);
    if (withdrawal.error) throw new Error(withdrawal.message);
    return withdrawal;
  }

  async getBanks() {
    const paystack = await this._initPaystackSdk();
    const banks = await paystack.getBanks();
    if (banks.error) throw new Error(banks.message);
    return banks;
  }

  async getInAppBankList() {
    const banks = await Bank.find();
    return banks;
  }

  async validateAccountNumber(data: { accountNumber: string; bankId: string }) {
    // const account = await this.paga.checkAccount({
    //   accountNumber: data.accountNumber,
    //   bankId: data.bankId,
    // });
    // if (account.error) throw new Error(account.message);
    // else {
    //   const payload = {
    //     accountNumber: data.accountNumber,
    //     accountName: account.destinationAccountHolderNameAtBank,
    //     fee: 60,
    //   };
    //   return payload;
    // }
    const paystack = await this._initPaystackSdk();
    const account = await paystack.verifyBankAccount({
      account_number: data.accountNumber,
      bank_code: data.bankId,
    });
    if (account.error) throw new Error(account.message);
    return account;
  }

  async validateWalletNumber(walletNumber: string) {
    const account = await this.queryAccountInfo({ walletNumber });
    if (!account) throw new Error('Oops!, invalid walletNumber');
    return account;
  }

  async deleteAccount(accountInfo: {
    user: string;
    walletReference: string;
    walletFor: PORTFOLIO;
  }) {
    const deletePagaAccount = await this.paga.deleteAccount(accountInfo);

    if (deletePagaAccount.error) throw new Error(deletePagaAccount.message);
    const filter =
      accountInfo.walletFor === PORTFOLIO.PATIENT
        ? { patient: accountInfo.user }
        : { healthWorker: accountInfo.user };
    const account = await Account.findOne(filter);
    if (!account) throw new Error('Oops!, account not found');
    await account.remove();
    return true;
  }

  async getPagaWalletBalance() {
    const balance = await this.paga.getPagaWalletBalance();
    if (balance.error) throw new Error(balance.message);
    return balance;
  }

  // async updateUserKycInfo(filter: Partial<UserKyc>, kycInfo: Partial<UserKyc>) {
  //   const kyc = await this.getUserKycInfo(filter);
  //   if (!kyc) {
  //     const newKyc = await UserKyc.create(kycInfo);
  //     return newKyc;
  //   }
  //   Object.assign(kyc, kycInfo);
  //   await kyc.save();
  //   return kyc;
  // }
  // async getUserKycInfo(filter: Partial<UserKyc>) {
  //   const kyc = await UserKyc.findOne(filter);
  //   // if (!kyc) throw new Error('Oops!, unable to get user kyc info');
  //   return kyc;
  // }
}
