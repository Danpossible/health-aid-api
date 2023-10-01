import { Schema, model } from 'mongoose';
import auditableFields from '../../plugins/auditableFields.plugin';
import { Pagination } from '../../plugins/paginate.plugin';
import toJSON from '../../plugins/toJson.plugin';
import paginate from '../../plugins/paginate.plugin';
import { Wallet } from '../../../../index';
import { PORTFOLIO } from '../../../../config/constants';

const WalletSchema = new Schema<Wallet>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
    },
    healthWorker: {
      type: Schema.Types.ObjectId,
      ref: 'HealthWorker',
    },
    walletFor: {
      type: String,
      enum: Object.values(PORTFOLIO),
      default: PORTFOLIO.PATIENT,
    },
    transactionPin: String,
    // availableBalance: { type: Number, default: 0 },
    balance: {
      available: { type: Number, default: 0 },
      ledger: { type: Number, default: 0 },
    },
    walletNumber: String,
    walletName: String,
    dvaID: String,
    bank: {
      name: String,
      id: String,
      slug: String,
    },
    assignment: {
      integration: Number,
      assigned_at: Date,
      assignee_id: String,
      expired: Boolean,
      account_type: String,
      assignee_type: String,
    },
    bankReferenceNumber: String,
    walletReference: String,
    stash: String,
    callbackUrl: String,
    locked: { type: Boolean, default: false },
    systemCode: String,
    ...auditableFields,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.bankReferenceNumber;
        delete ret.callbackUrl;
        return ret;
      },
    },
  },
);

WalletSchema.plugin(toJSON);
WalletSchema.plugin(paginate);
const Wallet: Pagination<Wallet> = model<Wallet, Pagination<Wallet>>(
  'Wallet',
  WalletSchema,
);
export default Wallet;
