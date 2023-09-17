/**
 * Use this module file to create instances of all controllers and simplify imports in to your routers
 */

import Paga from '../../services/Paga.service';
import AdminService from '../../services/admin.service';
import EmailService from '../../services/email.service';
import EncryptionService from '../../services/encryption.service';
import UserService from '../../services/patient.service';
import PaymentService from '../../services/payment.service';
import AdminController from './admin.controller';
import PaymentController from './payment.controller';
import UserController from './user.controller';

export const userController = new UserController(new UserService());

export const adminController = new AdminController(
  new AdminService(),
  new EncryptionService(),
  new EmailService(),
);

export const paymentController = new PaymentController(
  new PaymentService(new Paga(), new EmailService(), new UserService()),
  new UserService(),
  new EmailService(),
  new EncryptionService(),
);
