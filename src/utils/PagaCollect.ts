/* eslint-disable @typescript-eslint/no-explicit-any */
import { PAGA_BANK_ENDPOINT } from '../../config/constants';
import PagaUtilFunction, { ObjT } from './PagaUtilFunction';
import Builder from './PagaCollectClient';
import { PagaResponse, RegisterPersistentPaymentAccount } from '../..';

export default class PagaCollect extends PagaUtilFunction {
  constructor(build: {
    clientId: string;
    password: string;
    apiKey: string;
    test: boolean;
  }) {
    super(build);
  }

  /**
   * @param   {Object}  data              Request object
   * @param   {string}  data.referenceNumber - A unique reference number provided by the business, identifying the transaction. This reference number will be preserved on the Paga platform to reconcile the operation across systems and will be returned in the response.
   * @param   {string}  data.phoneNumber                        The amount of money to transfer to the recipient.
   * @param   {string}  data.firstName                      The currency of the operation, if being executed in a foreign currency.
   * @param   {string}  data.lastName           The account identifier for the recipient receiving the money transfer. This account identifier may be a phone number, account nickname, or any other unique account identifier supported by the Paga platform. If destinationBank is specified, this is the bank account number.
   * @param   {string}  data.accountName               For money transfers to a bank account, this is the destination bank code.
   * @param   {string}  data.financialIdentificationNumber   	The customer's Bank verification Number (BVN)
   * @param   {string}  data.walletReference              The authentication credentials for the user sending money if the money is being sent on behalf of a user
   * @param   {string=}  data.creditBankId                  public Id of the bank that you want deposits to be transferred directly to fo every payment.
   * @param   {string=}  data.creditBankAccountNumber       This must be provided if creditBankId is included in the request payload. It is the bank account number of the bank that you want deposits to be transferred to. This must be a valid account number for the bank specified by creditBankId
   * @param   {string=}  data.callbackUrl                   A custom callback URL for the payment webhook notifications for this specific account to be sent to. If provided, requests are sent to this URL exactly as provided. This allows you to set custom query parameters to the URL which you will be provided during webhook notifications for this specific account.
   *
   * @returns {Promise< {"error":false,
   *                    "response": {
   *                    "response" :0,
   *                    "message": null,
   *                    "referenceNumber": "0053459875439143453000",
   *                    "walletReference": "123467891334",
   *                    "accountNumber": "3414743183"},
   *                }>}  Register persistent payment account response
   */

  async registerPersistentPaymentAccount(
    data: Partial<RegisterPersistentPaymentAccount>,
  ): Promise<PagaResponse> {
    try {
      const {
        referenceNumber,
        phoneNumber,
        firstName,
        lastName,
        accountName,
        financialIdentificationNumber,
        walletReference,
        creditBankId = null,
        creditBankAccountNumber = null,
        callbackUrl,
      } = data;

      const requestData = {
        referenceNumber,
        phoneNumber,
        firstName,
        lastName,
        accountName,
        financialIdentificationNumber,
        accountReference: walletReference,
        creditBankId,
        creditBankAccountNumber,
        callbackUrl,
      };

      const hashObj = {
        referenceNumber,
        walletReference,
        financialIdentificationNumber,
        creditBankId,
        creditBankAccountNumber,
        callbackUrl,
      };

      const hashParams = Object.values(this.filterOptionalFields(hashObj)).join(
        '',
      );

      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<
        Partial<typeof hashObj>,
        PagaResponse
      >(
        header,
        this.filterOptionalFields(requestData),
        this.getBaseUrl(
          PAGA_BANK_ENDPOINT.REGISTER_PERSISTENT_PAYMENT_ACCOUNT,
          'collect',
        ),
      );

      return this.checkError<PagaResponse>(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
   * @param   {Object}  data              Request object
   * @param   {string}  data.referenceNumber - The unique reference number representing the update persistent payment account request.
   * @param   {string}  data.accountIdentifier - The accountIdentifier can be either the NUBAN or the walletReference that was provided when creating the persistent payment account
   * @param   {string=}  data.reason          Reason for deleting the account
   *
   * @returns {Promise< {"error":false,
   *                    "response": {
   *                    "response" :0,
   *                    "statusMessage": "success" },
   *                }>}  Delete persistent payment account response
   *
   *
   *
   */

  async deletePersistentPaymentAccount(data: {
    referenceNumber: string;
    accountIdentifier: string;
    reason?: null;
  }): Promise<PagaResponse> {
    try {
      const { referenceNumber, accountIdentifier, reason = null } = data;

      const requestData = {
        referenceNumber,
        accountIdentifier,
        reason,
      };

      const hashObj = {
        referenceNumber,
        accountIdentifier,
      };

      const hashParams = Object.values(hashObj).join('');

      const header = this.buildHeader(hashParams);

      const response = await this.postRequest<ObjT, PagaResponse>(
        header,
        this.filterOptionalFields(requestData),
        this.getBaseUrl(
          PAGA_BANK_ENDPOINT.DELETE_PERSISTENT_PAYMENT_ACCOUNT,
          'collect',
        ),
      );

      return this.checkError<PagaResponse>(response);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  /**
   * @param   {Object}  data              Request object
   * @param   {string}  data.referenceNumber - The unique reference number representing the payment request to be refunded.
   * @param   {string}  data.accountIdentifier  The accountIdentifier can be either the NUBAN or the walletReference the customer provided when creating the account
   *
   * @returns {Promise< {"error":false,
   *                    "response": {
   *                    "referenceNumber" : "12345",
   *                    "statusCode" : "0",
   *                    "statusMessage" : "success",
   *                    "walletReference": "000000000039",
   *                    "accountNumber": "3414743183",
   *                    "accountName": "Jermey Doe",
   *                    "phoneNumber": "08163232123",
   *                    "firstName": "Jermey",
   *                    "lastName": "Doe",
   *                    "financialIdentificationNumber": "12345454325",
   *                    "creditBankId": "1",
   *                    "creditBankAccountNumber": "0000000000",
   *                    "callbackUrl": "http://www.example.com/persistent/000000000008/Password10"
   *                     },
   *                }>}  Get Persistent payment account response
   *
   *
   *
   */
  async getPersistentPaymentAccount(data: {
    referenceNumber: string;
    accountIdentifier: string;
    reason?: null;
  }) {
    try {
      const { referenceNumber, accountIdentifier } = data;

      const requestData = {
        referenceNumber,
        accountIdentifier,
      };

      const hashObj = {
        referenceNumber,
        accountIdentifier,
      };

      const hashParams = Object.values(this.filterOptionalFields(hashObj)).join(
        '',
      );
      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<ObjT, PagaResponse>(
        header,
        this.filterOptionalFields(requestData),
        this.getBaseUrl(
          PAGA_BANK_ENDPOINT.GET_PERSISTENT_PAYMENT_ACCOUNT,
          'collect',
        ),
      );
      return this.checkError<PagaResponse>(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static Builder() {
    return new Builder();
  }
}
