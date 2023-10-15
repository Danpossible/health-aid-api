import { BaseResponse, ObjT } from '../../../index.d';
import axios from 'axios';
import config from '../../../config/default';

export default class PaystackUtilFunction {
  apiKey: string;
  constructor(build: { apiKey: string }) {
    this.apiKey = build.apiKey;
  }
  getBaseUrl() {
    return 'https://api.paystack.co';
  }

  filterOptionalFields(obj: ObjT): ObjT {
    const data = Object.keys(obj)
      .filter((k) => obj[k] !== null)
      .reduce(
        (a, k) => ({
          ...a,
          [k]: obj[k],
        }),
        {},
      );
    return data;
  }

  checkError<T extends BaseResponse>(response: T) {
    return {
      error: response.status === 'false' ? true : false,
      ...response,
    };
  }

  async postRequest<T, K>(headers: ObjT, jsonData: T, url: string): Promise<K> {
    const data = await axios({
      method: 'POST',
      url,
      headers: headers,
      data: jsonData,
    });
    const respStr = await data.data;
    let resp;
    try {
      resp = respStr;
      String(data.status).startsWith('2')
        ? Object.assign(resp, { status: 'success' })
        : Object.assign(resp, { status: 'error' });
    } catch (error) {
      resp = respStr;
    }

    return resp;
  }

  async getRequest<T>(headers: ObjT, url: string): Promise<T> {
    const data = await axios({
      method: 'GET',
      url,
      headers,
    });
    const respStr = await data.data;
    String(data.status).startsWith('2')
      ? Object.assign(respStr, { status: 'success' })
      : Object.assign(respStr, { status: 'error' });
    let resp;
    try {
      resp = JSON.parse(respStr);
    } catch (error) {
      resp = respStr;
    }
    return resp;
  }

  buildHeader(): ObjT {
    return {
      'Content-type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.paymentData.paystackSecretKey}`,
    };
  }
}
