/* eslint-disable @typescript-eslint/no-explicit-any */
import PagaUtilFunction from './PagaUtilFunction';
import Builder from './PagaBusinessClient';
import { PAGA_BANK_ENDPOINT } from '../../config/constants';
import log from '../logging/logger';
import {
  CheckAccountBalanceRequest,
  CheckAccountBalanceResponse,
  PagaResponse,
} from '../../index.d';

export default class PagaBusiness extends PagaUtilFunction {
  constructor(build: {
    clientId: string;
    password: string;
    apiKey: string;
    test: boolean;
  }) {
    super(build);
  }

  /**
     * @param   {string}    referenceNumber                     A unique reference number provided by the business, identifying the transaction. This reference number will be preserved on the Paga platform to reconcile the operation across systems and will be returned in the response.
     * @param   {number}    amount                              The amount of money to deposit to the destination bank and bank account provided. Your Paga account must contain sufficient funds to cover this amount plus any fees.
     * @param   {string}    currency                            The currency of the operation, if being executed in a foreign currency. The currency must be one of the currencies supported by the platform. For supported currencies, check with Paga integration operations support.
     * @param   {string}    destinationBankUUID                 The Paga bank UUID identifying the bank to which the deposit will be made. In order to get the list of supported banks and bank UUIDs, execute the getBanks operation defined in this document. Bank codes will not change though additional banks may be added to the list in the future.
     * @param   {string}    destinationBankAccountNumber        The ten digit NUBAN bank account number for the account to which the deposit will be made. This number should be a valid account number for the destination bank as specified by the destinationBankCode parameter above. Executing operation will validate this number and if valid, return the account holder name as stored at the bank for this account.
     * @param   {string}    recipientPhoneNumber                The mobile phone number of the recipient of the deposit to bank transaction. Either one or both of this parameter and the recipientEmail parameter must be provided. If this parameter is provided, this operation will validate that it is a valid phone number.
     * @param   {string}    recipientMobileOperatorCode         Ignored if recipientPhoneNumber parameter is not provided. This describes the mobile operator that the recipientPhoneNumber belongs to. If recipientPhoneNumber is provided, but this parameter is not, a default mobile operator will selected based on the phone number pattern, but this may not be correct due to number portability of mobile phone numbers and may result in delayed or failed delivery of any SMS messages to the recipient.
     * @param   {string}    recipientEmail                      The email address of the recipient of the deposit to bank transaction. Either one or both of this parameter and the recipientPhoneNumber parameter must be provided. If this parameter is provided, this operation will validate that it is a valid email address format.
     * @param   {string}    recipientName                       The name of the recipient. This parameter is currently not validated.
     * @param   {string}    alternateSenderName                 In notifications sent to the recipient, your business display name (if set), or business name (if display name not set) is included. If you wish notifications to indicate the deposit to bank as coming from an alternate name, you may set the alternate name in this parameter. This parameter length is limited to 20 characters and will be truncated if longer.
     * @param   {string}    suppressRecipientMessage            If this field is set to true, no notification message (SMS or email) will be sent to the recipient. IF omitted or set to false, an email or SMS will be sent to recipient as described above.
     * @param   {string}    remarks                             Additional bank transfer remarks that you may wish to appear on your bank statement record for this transaction. Remarks are limited to 30 characters and will be truncated if longer.
     * @param   {string}    locale                              The language/locale to be used in messaging. If provided, this must conform to the IETF language tag standard.
     
     * @return {Promise}                                        A Promise Object thats receives the response
                                                    
        Sample Successful Response =>   {
                                            "referenceNumber":"+251911314250",
                                            "message":"Airtime purchase request made successfully",
                                            "responseCode":0, "transactionId":  "", "fee":50.0,
                                            "currency": "", "exchangeRate": "", "destinationAccountHolderNameAtBank":null
                                        }
                                                    
                                                    
     */

  async depositToBank(
    reference: string,
    amount: string,
    currency: string,
    destinationBankUUID: string,
    destinationBankAccountNumber: string,
    recipientPhoneNumber: string,
    recipientMobileOperatorCode: string,
    recipientEmail: string,
    recipientName: string,
    alternateSenderName: string,
    suppressRecipientMessage: string,
    remarks: string,
    locale: string,
  ): Promise<PagaResponse> {
    try {
      const data = {
        referenceNumber: reference,
        amount,
        currency,
        destinationBankUUID,
        destinationBankAccountNumber,
        recipientPhoneNumber,
        recipientMobileOperatorCode,
        recipientEmail,
        recipientName,
        alternateSenderName,
        suppressRecipientMessage,
        remarks,
        locale,
      };

      const hashParams = `${reference}${amount}${destinationBankUUID}${destinationBankAccountNumber}`;
      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<
        Partial<typeof data>,
        PagaResponse
      >(header, data, this.getBaseUrl('depositToBank', 'business'));
      return this.checkError<PagaResponse>(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
     * @param   {string}    referenceNumber                     A unique reference number provided by the business, identifying the transaction. This reference number will be preserved on the Paga platform to reconcile the operation across systems and will be returned in the response.
     * @param   {number}    amount                              The amount of money to deposit to the destination bank and bank account provided. Your Paga account must contain sufficient funds to cover this amount plus any fees.
     * @param   {string}    currency                            The currency of the operation, if being executed in a foreign currency. The currency must be one of the currencies supported by the platform. For supported currencies, check with Paga integration operations support.
     * @param   {string}    destinationBankUUID                 The Paga bank UUID identifying the bank to which the deposit will be made. In order to get the list of supported banks and bank UUIDs, execute the getBanks operation defined in this document. Bank codes will not change though additional banks may be added to the list in the future.
     * @param   {string}    destinationBankAccountNumber        The ten digit NUBAN bank account number for the account to which the deposit will be made. This number should be a valid account number for the destination bank as specified by the destinationBankCode parameter above. Executing operation will validate this number and if valid, return the account holder name as stored at the bank for this account.
     * @param   {string}    recipientPhoneNumber                The mobile phone number of the recipient of the deposit to bank transaction. Either one or both of this parameter and the recipientEmail parameter must be provided. If this parameter is provided, this operation will validate that it is a valid phone number.
     * @param   {string}    recipientMobileOperatorCode         Ignored if recipientPhoneNumber parameter is not provided. This describes the mobile operator that the recipientPhoneNumber belongs to. If recipientPhoneNumber is provided, but this parameter is not, a default mobile operator will selected based on the phone number pattern, but this may not be correct due to number portability of mobile phone numbers and may result in delayed or failed delivery of any SMS messages to the recipient.
     * @param   {string}    recipientEmail                      The email address of the recipient of the deposit to bank transaction. Either one or both of this parameter and the recipientPhoneNumber parameter must be provided. If this parameter is provided, this operation will validate that it is a valid email address format.
     * @param   {string}    recipientName                       The name of the recipient. This parameter is currently bot validated.
     * @param   {string}    locale                              The language/locale to be used in messaging. If provided, this must conform to the IETF language tag standard.
     
     * @return {Promise}                                        A Promise Object thats receives the response
                                                    
        Sample Successful Response =>   {
                                            "referenceNumber":"+251911314250",
                                            "message":"Airtime purchase request made successfully",
                                            "responseCode":0, , "fee":50.0, "destinationAccountHolderNameAtBank":null
                                        }
                                                    
     */

  async validateDepositToBank(
    referenceNumber: string,
    amount: string,
    currency: string,
    destinationBankUUID: string,
    destinationBankAccountNumber: string,
    recipientPhoneNumber?: string,
    recipientMobileOperatorCode?: string,
    recipientEmail?: string,
    recipientName?: string,
    locale?: string,
  ): Promise<PagaResponse> {
    try {
      const data = {
        referenceNumber,
        amount,
        currency,
        destinationBankUUID,
        destinationBankAccountNumber,
        recipientPhoneNumber,
        recipientMobileOperatorCode,
        recipientEmail,
        recipientName,
        locale,
      };

      const hashParams = `${referenceNumber}${amount}${destinationBankUUID}${destinationBankAccountNumber}`;
      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<typeof data, PagaResponse>(
        header,
        data,
        this.getBaseUrl('validateDepositToBank', 'business'),
      );
      return this.checkError<PagaResponse>(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
   * @param   {Object}  data              Request object
   * @param   {string}  data.referenceNumber - A unique reference number representing this request. The same reference number will be returned in the response.
   *
   * @returns {Promise< {"error":false,
   *                    "response": {
   *                    "referenceNumber" : "12345",
   *                    "statusCode" : "0",
   *                    "statusMessage" : "success",
   *                    "banks" : [
   *                      {
   *                          "name" : "GT Bank",
   *                          "uuid" : "3E94C4BC-6F9A-442F-8F1A-8214478D5D86"
   *                      },
   *                      {
   *                          "name" : "Access Bank",
   *                          "uuid" : "F8F3EFBF-67CB-4C17-A079-B7CFE95F71BE"
   *                     }
   *                    ]
   *                     },
   *                }>}  Get banks account response
   */
  async getBanks(referenceNumber: any, locale?: string): Promise<PagaResponse> {
    try {
      const requestData = {
        referenceNumber,
        locale,
      };

      const hashParams = referenceNumber;
      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<typeof requestData, PagaResponse>(
        header,
        requestData,
        this.getBaseUrl(PAGA_BANK_ENDPOINT.GET_BANKS, 'business'),
      );
      log.info({ banks: response });
      return this.checkError<PagaResponse>(response);
    } catch (err: any) {
      throw Error(err);
    }
  }

  /**
     * @param   {string}    referenceNumber         A unique reference number provided by the business, identifying the transaction. This reference number will be preserved on the Paga platform to reconcile the operation across systems and will be returned in the response.
     * @param   {string}    accountPrincipal        The authentication principal for the user who's balance is being inquired, if the inquiry is being made on behalf of a user. If null, the balance inquiry will be processed from the 3rd parties own account.
     * @param   {string}    accountCredentials      The authentication credentials for the user who's balance is being inquired, if the inquiry is being made on behalf of a user.
     * @param   {string}    sourceOfFunds           The name of a source account on which to check the balance. If null, the Paga account balance with be retrieved.
     * @param   {string}    locale                  The language/locale to be used in messaging. If provided, this must conform to the IETF language tag standard.
     
     * @return {Promise}                            A Promise Object thats receives the response
                                                    
        Sample Successful Response =>   {
                                            "referenceNumber":"+251911314250", "message":"Airtime purchase request made successfully",
                                            "responseCode":0, ,”totalBalance”:”100.0”,”availableBalance”:50.0,
                                            ”currency”:null,“balanceDateTimeUTC”:null
                                        }
                                                    
     */
  async accountBalance(
    data: Partial<CheckAccountBalanceRequest>,
  ): Promise<CheckAccountBalanceResponse> {
    try {
      const hashParams = data.referenceNumber;
      const header = this.buildHeader(hashParams);
      const response = await this.postRequest<
        typeof data,
        CheckAccountBalanceResponse
      >(header, data, this.getBaseUrl('accountBalance', 'business'));
      return this.checkError<CheckAccountBalanceResponse>(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  static Builder() {
    return new Builder();
  }
}
