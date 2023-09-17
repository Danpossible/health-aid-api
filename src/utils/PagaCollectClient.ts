import PagaCollect from './PagaCollect';

export default class PagaCollectClient {
  clientId: string;
  password: string;
  apiKey: string;
  test: boolean;

  setClientId(clientId: string) {
    this.clientId = clientId;
    return this;
  }

  setPassword(password: string) {
    this.password = password;
    return this;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    return this;
  }

  setTest(test: boolean) {
    this.test = test;
    return this;
  }

  build() {
    return new PagaCollect(this);
  }
}
