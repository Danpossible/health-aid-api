import { Schema, model } from 'mongoose';
import {
  PORTFOLIO,
  TRANSACTION_SOURCES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} from '../../../../config/constants';
import auditableFields from '../../plugins/auditableFields.plugin';
import toJSON from '../../plugins/toJson.plugin';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import { TransactionLog } from '../../../..';

const transactionLogSchema = new Schema<TransactionLog>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    healthWorker: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    for: {
      type: String,
      enum: Object.values(PORTFOLIO),
      default: PORTFOLIO.HEALTH_WORKER,
    },
    balanceAfterTransaction: {
      type: Number,
    },
    fees: { type: Number, default: 0 },
    transactionDump: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'TransactionDump',
    },
    type: {
      type: String,
      enums: Object.values(TRANSACTION_TYPES),
    },
    amount: {
      type: Number,
    },
    source: {
      type: String,
      enum: Object.values(TRANSACTION_SOURCES),
    },
    reference: {
      type: String,
      required: false,
    },
    purpose: {
      type: String,
      required: false,
    },
    meta: {
      type: Object,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      required: false,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    ...auditableFields,
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
transactionLogSchema.plugin(toJSON);
transactionLogSchema.plugin(paginate);

/**
 * @typedef TransactionLog
 */
const TransactionLog: Pagination<TransactionLog> = model<
  TransactionLog,
  Pagination<TransactionLog>
>('TransactionLog', transactionLogSchema);

export default TransactionLog;
