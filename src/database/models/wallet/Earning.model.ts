import { Schema, model } from 'mongoose';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import auditableFields from '../../plugins/auditableFields.plugin';
import { HealthAidEarnings } from '../../../../index';
import toJSON from '../../plugins/toJson.plugin';
import { PORTFOLIO } from '../../../../config/constants';

const HealthAidEarningsSchema = new Schema<HealthAidEarnings>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    for: {
      type: String,
      enum: Object.values(PORTFOLIO),
    },
    amount: {
      type: Number,
      required: true,
    },
    charge: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      default: 'card',
    },
    profit: Number,
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'TransactionLog',
    },
    amountSpent: Number,
    earningsIn: {
      type: String,
      enum: ['kuda', 'flutterwave', 'paga'],
    },
    ...auditableFields,
  },
  { timestamps: true },
);

HealthAidEarningsSchema.plugin(paginate);
HealthAidEarningsSchema.plugin(toJSON);

const HealthAidEarnings: Pagination<HealthAidEarnings> = model<
  HealthAidEarnings,
  Pagination<HealthAidEarnings>
>('HealthAidEarnings', HealthAidEarningsSchema);
export default HealthAidEarnings;
