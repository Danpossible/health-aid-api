import config from '../../config/default';
import HelperClass from '../utils/helper';
import PagaBusinessClient from '../utils/PagaBusinessClient';
import PagaCollectClient from '../utils/PagaCollectClient';
import generateTxRef from '../utils/generateTxRef';
import Bank from '../database/models/wallet/Bank.model';
import { Wallet } from '../../index.d';

export default class Paga {
  private async initPagaCollect() {
    return new PagaCollectClient()
      .setClientId(config.paymentData.paga_public_key)
      .setPassword(config.paymentData.paga_secret)
      .setApiKey(config.paymentData.paga_key)
      .setTest(Boolean(config.paymentData.isPagaTestEnv))
      .build();
  }
  private async initPagaBusiness() {
    return new PagaBusinessClient()
      .setClientId(config.paymentData.paga_public_key)
      .setPassword(config.paymentData.paga_secret)
      .setApiKey(config.paymentData.paga_key)
      .setTest(Boolean(config.paymentData.isPagaTestEnv))
      .build();
  }

  public async generatePermanentAccount(data: any) {
    const paga = await this.initPagaCollect();
    data.referenceNumber = generateTxRef(16, 'num');
    data.walletReference = HelperClass.generateRandomChar(24, 'num');
    data.currency = 'NGN';
    data.callbackUrl = `${config.baseApiUrl}/api/v1/payment/funding/${data.referenceNumber}`;

    const accountInfo = await paga.registerPersistentPaymentAccount(data);
    if (!accountInfo.error) accountInfo.callbackUrl = data.callbackUrl;
    return accountInfo;
  }

  async withdraw(data: any) {
    const reference = generateTxRef(16, 'num');
    if (config.environment === 'production') {
      const paga = await this.initPagaBusiness();
      const response = await paga.depositToBank(
        reference,
        data.amount,
        'NGN',
        data.bankId,
        data.accountNumber,
        '',
        '',
        `${generateTxRef(16, 'lower')}@Sinnts.com`,
        '',
        '',
        'true',
        `Sinnts/${data.firstName} ${data.lastName}/${reference}`,
        '',
      );
      return response;
    }

    const checkAccount = await this.checkAccount({
      bankId: data.bankId,
      accountNumber: data.accountNumber,
    });
    return {
      error: false,
      responseCode: 0,
      responseCategoryCode: null as null,
      message: `Successfully deposited N${data.amount} to ${
        data.accountNumber
      }. Transaction Id: ${generateTxRef(16, 'num')}.`,
      reference,
      transactionId: HelperClass.generateRandomChar(6, 'num'),
      currency: 'NGN',
      exchangeRate: null as null,
      fee: 53.75,
      sessionId: generateTxRef(16, 'num'),
      vat: 3.75,
      destinationAccountHolderNameAtBank:
        checkAccount.destinationAccountHolderNameAtBank,
    };
  }

  async checkAccount(data: { bankId: string; accountNumber: string }) {
    const reference = generateTxRef(16, 'num');
    const paga = await this.initPagaBusiness();
    const response = await paga.validateDepositToBank(
      reference,
      '1',
      'NGN',
      data.bankId,
      data.accountNumber,
    );
    return response;
  }

  async getBanks() {
    const paga = await this.initPagaBusiness();
    const response = await paga.getBanks(generateTxRef(8, 'num'));

    if (!response.error) {
      await Bank.deleteMany({ name: { $ne: null } });
      await Bank.insertMany(response.banks);
    }

    return response.banks;
  }

  async deleteAccount(accountInfo: Partial<Wallet>) {
    const paga = await this.initPagaCollect();
    const response = await paga.deletePersistentPaymentAccount({
      referenceNumber: generateTxRef(16, 'num'),
      accountIdentifier: accountInfo.walletReference,
    });
    return response;
  }

  async getPagaWalletBalance() {
    const paga = await this.initPagaBusiness();
    const response = await paga.accountBalance({
      referenceNumber: generateTxRef(16, 'num'),
    });
    return response;
  }
}
