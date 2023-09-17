import Route from 'express';
import { isUserAuthenticated } from '../../middlewares/auth.middleware';
import { paymentController } from '../../controllers/controllers.module';
import validate from '../../middlewares/validate';
import {
  validateAccount,
  inAppTransfer,
  transactionPin,
  withdrawal,
} from '../../../validators/Payment.validation';

const router = Route();

router
  .route('/funding/:reference')
  .get((req, res) => {
    paymentController.creditAccount(req, res);
  })
  .post((req, res) => {
    paymentController.creditAccount(req, res);
  });
router.route('/account-info').get(isUserAuthenticated, (req, res, next) => {
  paymentController.getAccountInfo(req, res, next);
});
router.route('/delete-account').get(isUserAuthenticated, (req, res, next) => {
  paymentController.deleteAccount(req, res, next);
});
router
  .route('/withdraw')
  .post(isUserAuthenticated, validate(withdrawal), (req, res, next) => {
    paymentController.withdrawMoney(req, res, next);
  });

router
  .route('/in-app-transfer')
  .post(isUserAuthenticated, validate(inAppTransfer), (req, res, next) => {
    paymentController.inAppTransfer(req, res, next);
  });

router.route('/bank-list').get(isUserAuthenticated, (req, res, next) => {
  paymentController.getBankList(req, res, next);
});

router
  .route('/validate-account')
  .post(isUserAuthenticated, validate(validateAccount), (req, res, next) => {
    paymentController.validateAccount(req, res, next);
  });

router.route('/validate-wallet-code').post((req, res, next) => {
  paymentController.validatewalletNumber(req, res, next);
});

router.route('/transactions').get(isUserAuthenticated, (req, res, next) => {
  paymentController.getTransactions(req, res, next);
});

router.route('/transaction/:id').get(isUserAuthenticated, (req, res, next) => {
  paymentController.getTransaction(req, res, next);
});

router
  .route('/transaction-pin')
  .post(isUserAuthenticated, validate(transactionPin), (req, res, next) => {
    paymentController.verifyPin(req, res, next);
  })
  .patch(isUserAuthenticated, validate(transactionPin), (req, res, next) => {
    paymentController.saveTransactionPin(req, res, next);
  });

router
  .route('/reset-txpin')
  .patch(isUserAuthenticated, (req, res, next) => {
    paymentController.resetPin(req, res, next);
  })
  .post(isUserAuthenticated, (req, res, next) => {
    paymentController.sendPinResetEmail(req, res, next);
  });

export default router;
