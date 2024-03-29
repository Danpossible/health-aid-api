import config from '../../config/default';
const ADMIN_LOGIN_CREDENTIALS = (
  fullName: string,
  message: string,
  password: string,
) => `
    <div style="background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">
            <div style="text-align: center;">
                <img src="https://res.cloudinary.com/dner6aes8/image/upload/v1689029497/health-aid-logo/Group_36781_wz9xxl.png" alt="${config.appName} Logo" style="width: 100px; height: 100px;"/>
            </div>
            <h2 style="text-align: center;">Login Credentials</h2>
            <p style="text-align: center;">Hi ${fullName},</p>
            <p style="text-align: center;">${message}</p>
            <p style="text-align: center;">Your password is: ${password}</p>
            <p style="text-align: center;">Please contact
                <a href="mailto:

                "> Support
                </a>
                for assistance.
            </p>
            <p style="text-align: center;">Thank you.</p>
        </div>
    </div>
    
`;

export default ADMIN_LOGIN_CREDENTIALS;
