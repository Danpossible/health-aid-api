import crypto from 'crypto';
import fetch from 'node-fetch';
import config from '../../config/default';
import log from '../logging/logger';
import { PagaBaseResponse, PagaResponse } from '../../index.d';
// import axios from 'axios';

export interface ObjT {
  [key: string]: string;
}

export default class PagaUtilFunction {
  apiKey: string;
  clientId: string;
  password: string;
  test: boolean;
  constructor(build: {
    clientId: string;
    password: string;
    apiKey: string;
    test: boolean;
  }) {
    this.clientId = build.clientId;
    this.password = build.password;
    this.apiKey = build.apiKey;
    this.test = build.test;
  }

  getBaseUrl(PAGA_BANK_ENDPOINT: string, urlType: string) {
    const testBusinessServer =
      'https://beta.mypaga.com/paga-webservices/business-rest/secured/';
    const liveBusinessServer =
      'https://www.mypaga.com/paga-webservices/business-rest/secured/';
    const testCollectServer = `https://beta-collect.paga.com/`;
    const liveCollectServer = `https://collect.paga.com/`;
    if (urlType === 'collect') {
      const url = this.test ? testCollectServer : liveCollectServer;
      return `${url}${PAGA_BANK_ENDPOINT}`;
    } else {
      const url = this.test ? testBusinessServer : liveBusinessServer;
      return `${url}${PAGA_BANK_ENDPOINT}`;
    }
  }

  generateHash(hasParams: string) {
    const hash = crypto
      .createHash('sha512')
      .update(hasParams, 'utf-8')
      .digest('hex');
    return hash;
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

  checkError<T extends PagaBaseResponse>(response: T): T {
    const { responseCode, statusCode } = response;
    if (parseInt(responseCode) === 0 || parseInt(statusCode) === 0) {
      return {
        error: false,
        ...response,
      };
    } else {
      return {
        error: true,
        ...response,
      };
    }
  }

  buildHeader(hashParams: string): ObjT {
    const pattern = `${hashParams}${this.apiKey}`;
    const hashData = this.generateHash(pattern);
    return {
      'Content-type': 'application/json',
      Accept: 'application/json',
      principal: this.clientId,
      credentials: this.password,
      Authorization: `Basic ${config.paymentData.pagaAuthorizationKey}`,
      hash: hashData,
    };
  }

  async postRequest<T, K>(headers: ObjT, jsonData: T, url: string): Promise<K> {
    const data = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsonData),
    });
    const respStr = await data.text();
    const res = this.checkError<PagaResponse>(JSON.parse(respStr));
    !res.error ? log.info(respStr) : log.error(respStr);
    let resp;
    try {
      resp = JSON.parse(respStr);
    } catch (error) {
      log.error(error);
      resp = respStr;
    }

    return resp;
  }

  buildFormHeader(hashParams: string): ObjT {
    const pattern = `${hashParams}${this.apiKey}`;
    const hashData = this.generateHash(pattern);
    return {
      'content-type': 'multipart/form-data',
      boundary: 'TEIJNCQ5bVQ6ocfU4BSpKzMEZ2nN7t',
      Accept: 'application/json',
      principal: this.clientId,
      credentials: this.password,
      hash: hashData,
      'Content-Disposition': 'form-data',
      name: 'customer',
      filename: 'file',
      'Content-Type': 'application/json',
    };
  }
}
