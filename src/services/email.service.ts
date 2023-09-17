import config from '../../config/default';
import NodemailerModule from '../modules/NodemailerModule';
import log from '../logging/logger';
import PASSWORD_RESET_EMAIL from '../mail/password-reset';
import WELCOME_EMAIL from '../mail/welcome-email';
import EMAIL_VERIFICATION from '../mail/email-verification';
import ADMIN_LOGIN_CREDENTIALS from '../mail/admin-login-credentials';
import TRANSACTION_NOTIFICATION from '../mail/transaction-notification';
const _nodeMailerModule = new NodemailerModule();

const emailType: EmailType = {
  WELCOME_EMAIL: [`Welcome to ${config.appName}`, 'welcome'],
  PASSWORD_RESET_INSTRUCTION: ['Password Reset Requested', 'password-reset'],
  PASSWORD_RESET_SUCCESSFUL: ['Password Reset', 'password-reset-successful'],
  EMAIL_VERIFICATION: [
    `[${config.appName}] Email Verification Requested`,
    'email-verification',
  ],
  PASSWORD_CHANGED: ['Password Changed', 'password-changed'],
  PAYMENT_TRACKING: ['Payment Tracking', 'payment-tracking'],
  TRANSACTION_NOTIFICATION: [
    `${config.appName} Transaction Notification`,
    'transaction-notification',
  ],
  PAYMENT_UNSUCCESSFUL: ['Payment Unsuccessful', 'payment-unsuccessful'],
  SCHEDULE_ENDED: ['Schedule payment period ended', 'schedule-ended'],
  ADMIN_LOGIN_CREDENTIALS: [
    `${config.appName} Login Credentials`,
    'admin-login-credentials',
  ],
};

type Data = {
  [T: string]: string;
};

type EmailOptions = {
  from: string;
  to: string;
  html?: string;
  fullName?: string;
  subject?: string;
};

type EmailType = {
  [k: string]: string[];
};
export default class EmailService {
  /** Send email takes the following parameters:
   * type - refers to the type of the email eg WelcomeEmail
   * to - refers to who you are sending the email to
   * data - refers to what you want to send to the Patient
   */
  async _sendMail(type: string, email: string, data: Data) {
    const mailOptions: EmailOptions = {
      from: config.from,
      to: email,
    };
    const [subject, templatePath] = emailType[type] || [];
    if (!subject || !templatePath) return;
    switch (templatePath) {
      case 'welcome':
        mailOptions.html = WELCOME_EMAIL(data.fullName, data.url);
        mailOptions.subject = `${subject} ${data.fullName}`;
        break;
      case 'password-reset':
        mailOptions.html = PASSWORD_RESET_EMAIL(data.fullName, data.token);
        mailOptions.subject = `[URGENT] - ${subject}`;
        break;
      case 'email-verification':
        mailOptions.html = EMAIL_VERIFICATION(data.fullName, data.token);
        mailOptions.subject = subject;
        break;
      case 'admin-login-credentials':
        mailOptions.html = ADMIN_LOGIN_CREDENTIALS(
          data.fullName as string,
          data.message as string,
          data.password as string,
        );
        mailOptions.subject = `${subject}`;
        break;
      case 'transaction-notification':
        mailOptions.html = TRANSACTION_NOTIFICATION(
          data.fullName,
          data.message,
        );
        mailOptions.subject = subject;
        break;
    }

    await _nodeMailerModule.send(mailOptions);
    log.info(`Email on it's way to ${email}`);
  }

  async _sendWelcomeEmail(fullName: string, email: string) {
    return await this._sendMail('WELCOME_EMAIL', email, { fullName });
  }

  async _sendPatientEmailVerificationEmail(
    fullName: string,
    email: string,
    token: string,
  ) {
    return await this._sendMail('EMAIL_VERIFICATION', email, {
      fullName,
      token,
    });
  }

  async _sendPatientPasswordResetInstructionEmail(
    fullName: string,
    email: string,
    token: string,
  ) {
    return await this._sendMail('PASSWORD_RESET_INSTRUCTION', email, {
      fullName,
      token,
    });
  }

  async sendPaymentTrackingEmail(message: string) {
    return await this._sendMail('PAYMENT_TRACKING', 'info.ezecodes@gmail.com', {
      message,
    });
  }

  async transactionNotificationEmail(
    to: string,
    fullName: string,
    message: string,
  ) {
    return await this._sendMail('TRANSACTION_NOTIFICATION', to, {
      fullName,
      message,
    });
  }

  async paymentUnsuccessfulEmail(
    to: string,
    fullName: string,
    message: string,
  ) {
    return await this._sendMail('PAYMENT_UNSUCCESSFUL', to, {
      fullName,
      message,
    });
  }

  async scheduleEndedEmail(to: string, fullName: string, message: string) {
    return await this._sendMail('SCHEDULE_ENDED', to, {
      fullName,
      message,
    });
  }

  async sendAdminLoginCredentials(
    to: string,
    fullName: string,
    message: string,
    password: string,
  ) {
    return await this._sendMail('ADMIN_LOGIN_CREDENTIALS', to, {
      fullName,
      message,
      password,
    });
  }
  async sendTxPinResetEmail(
    fullName: string,
    email: string,
    token: string,
  ): Promise<void> {
    return await this._sendMail('SEND_TX_PIN_RESET', email, {
      fullName,
      token,
    });
  }
}
