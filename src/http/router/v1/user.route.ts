import { Router } from 'express';
import { userController } from '../../controllers/controllers.module';
import { isUserAuthenticated } from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate';
import {
  resetPassword,
  updatePatientAccount,
} from '../../../validators/auth-validator';
import { updateKyc } from '../../../validators/health_worker.validator';
import { restrictAccessTo } from '../../middlewares/role.middleware';
import { PORTFOLIO } from '../../../../config/constants';

const router = Router();

router.route('/notification').get(isUserAuthenticated, (req, res, next) => {
  userController.getNotifications(req, res, next);
});

router
  .route('/me')
  .get(isUserAuthenticated, (req, res, next) => {
    userController.getMyProfile(req, res, next);
  })
  .patch(
    isUserAuthenticated,
    validate(updatePatientAccount),
    (req, res, next) => {
      userController.updateMyProfile(req, res, next);
    },
  );

router
  .route('/me/reset-password')
  .patch(isUserAuthenticated, validate(resetPassword), (req, res, next) => {
    userController.resetPassword(req, res, next);
  });

/** Health workers */
router
  .route('/complete-profile')
  .patch(
    isUserAuthenticated,
    validate(updateKyc),
    restrictAccessTo(PORTFOLIO.HEALTH_WORKER),
    (req, res, next) => {
      userController.completeProfile(req, res, next);
    },
  );

// router
//   .route('/upload-avatar')
//   .patch(isUserAuthenticated, upload.single('file'), (req, res, next) => {
//     userController.uploadAvatar(req, res, next);
//   });

router.get('/search', isUserAuthenticated, (req, res, next) => {
  userController.searchPatients(req, res, next);
});

router.route('/device').post(isUserAuthenticated, (req, res, next) => {
  userController.savePatientDeviceInfo(req, res, next);
});

router.get('/:userId', isUserAuthenticated, (req, res, next) => {
  userController.getPatientProfile(req, res, next);
});

export default router;
