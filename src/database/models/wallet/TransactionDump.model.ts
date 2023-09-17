import { Schema, model } from 'mongoose';
import toJSON from '../../plugins/toJson.plugin';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import { TransactionDump } from '../../../../index.d';

const transactionDumpSchema = new Schema<TransactionDump>(
  {
    data: {
      type: Object,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
transactionDumpSchema.plugin(toJSON);
transactionDumpSchema.plugin(paginate);

/**
 * @typedef TransactionDump
 */
const TransactionDump: Pagination<TransactionDump> = model<
  TransactionDump,
  Pagination<TransactionDump>
>('TransactionDump', transactionDumpSchema);

export default TransactionDump;
