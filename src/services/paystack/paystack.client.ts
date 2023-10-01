import PaystackSdk from './paystack.sdk';

export default class PaystackClient {
  apiKey: string;
  production: boolean;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    return this;
  }

  //   setProduction(production: boolean) {
  //     this.production = production;
  //     return this;
  //   }

  build() {
    return new PaystackSdk(this);
  }
}
