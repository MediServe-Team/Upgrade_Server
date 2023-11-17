import dotenv from 'dotenv';
dotenv.config();

// subject template mail create staff account
export const MAIL_CREATE_SUBJECT = '[MediServe provide staff Account]';

export const templateCreateAccount = (name = '', password) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
      <style>
          body {
              display: flex;
              margin: 0;
              padding: 0;
              color: #000000;
              font-family: Arial, sans-serif;
          }
  
          .container {
              max-width: 600px;
              margin: auto auto;
              padding: 30px;
              border: #f0f0f0 2px solid;
              border-radius: 8px;
              background-color: #f6fafc;
          }
  
          p {
              line-height: 1.4;
              margin-bottom: 15px;
          }
  
          h1 {
              padding: 0;
              margin: 0;
              font-size: 26px;
          }
  
          hr {
              border-color: #ffffff;
          }
  
          .wrap-password {
              display: flex;
              padding: 30px 0;
          }
  
          .password {
              margin-left: auto;
              margin-right: auto;
              display: inline-block;
              background-color: #f1c358;
              padding: 10px 40px;
              border-radius: 4px;
              font-size: 30px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 15px;
          }
  
          .wrap-button {
              display: flex;
          }
  
          .login-button {
              display: inline-block;
              background-color: #3AAEE0;
              padding: 10px 20px;
              border-radius: 4px;
              font-weight: bold;
              text-align: center;
              color: #FFFFFF;
              text-decoration: none;
              margin: 15px auto 0;
              box-shadow: 0 5px 10px rgba(58, 174, 224, 0.5);
          }
  
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Hello ${name},</h1>
          <p>Below you can find your temporary password.</p>
          <hr/>
          <div class="wrap-password">
              <div class="password">${password}</div>
          </div>
          <hr/>
          <p>Use the above password to log in to the MediServe management application!</p>
          <p><b>Thank you, <br/>Admin MediServe system!</b></p>
          <div class="wrap-button">
              <a href="${process.env.APP_LOGIN_URL}" class="login-button">Login MediServe</a>
          </div>
      </div>
  </body>
  </html>
    `;
};
