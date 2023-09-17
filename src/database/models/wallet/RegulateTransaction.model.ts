import { Schema, model } from 'mongoose';
import toJSON from '../../plugins/toJson.plugin';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import { RegulateTransaction } from '../../../../index.d';

const regulateTransactionSchema = new Schema<RegulateTransaction>(
  {
    idempotentKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
regulateTransactionSchema.plugin(toJSON);
regulateTransactionSchema.plugin(paginate);

/**
 * @typedef RegulateTransaction
 */
const RegulateTransaction: Pagination<RegulateTransaction> = model<
  RegulateTransaction,
  Pagination<RegulateTransaction>
>('RegulateTransaction', regulateTransactionSchema);

export default RegulateTransaction;
