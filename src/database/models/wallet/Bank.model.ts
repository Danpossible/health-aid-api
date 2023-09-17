import { Schema, model } from 'mongoose';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import toJSON from '../../plugins/toJson.plugin';
import { BankInterface } from '../../../../index.d';

const bankSchema = new Schema<BankInterface>({
  name: {
    type: String,
  },
  uuid: {
    type: String,
  },
  interInstitutionCode: {
    type: String,
  },
  sortCode: {
    type: String,
  },
});

// add plugin that converts mongoose to json
bankSchema.plugin(toJSON);
bankSchema.plugin(paginate);

/**
 * @typedef Bank
 */
const Bank: Pagination<BankInterface> = model<
  BankInterface,
  Pagination<BankInterface>
>('Bank', bankSchema);

export default Bank;
