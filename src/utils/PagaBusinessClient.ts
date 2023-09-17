import PagaBusiness from './PagaBusiness';

export default class PagaBusinessClient {
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
    return new PagaBusiness(this);
  }
}
