import { Schema, model } from 'mongoose';
import toJSON from '../../plugins/toJson.plugin';
import paginate, { Pagination } from '../../plugins/paginate.plugin';
import { ErrorTracker } from '../../../../index';

const errorTrackerSchema = new Schema<ErrorTracker>(
  {
    stackTrace: {
      type: Map,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
errorTrackerSchema.plugin(toJSON);
errorTrackerSchema.plugin(paginate);

const ErrorTracker: Pagination<ErrorTracker> = model<
  ErrorTracker,
  Pagination<ErrorTracker>
>('ErrorTracker', errorTrackerSchema);

export default ErrorTracker;
