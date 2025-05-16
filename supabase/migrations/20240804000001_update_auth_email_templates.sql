-- Update the email templates for authentication emails
BEGIN;

-- Update the email template for magic link/OTP
-- Supabase stores email templates in auth.mfa_amr_claims for newer versions
UPDATE auth.mfa_amr_claims
SET content = jsonb_set(content, '{email_template}', '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PayNomad Capital - Verify Your Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2c3e50;
      padding: 20px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0077be;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PayNomad Capital</h1>
  </div>
  <div class="content">
    <h2>Verify Your Email</h2>
    <p>Hello,</p>
    <p>Thank you for registering with PayNomad Capital. Please click the button below to verify your email address and complete your registration.</p>
    <p style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
    </p>
    <p>If you did not request this verification, please ignore this email.</p>
    <p>This link will expire in 24 hours.</p>
  </div>
  <div class="footer">
    <p>&copy; 2024 PayNomad Capital Ltd. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>'::jsonb)
WHERE id = 'email_otp';

-- Alternative approach if the above doesn't work
-- This sets the email template in the auth.flow_state table which is also used for email templates
UPDATE auth.flow_state
SET email_template = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PayNomad Capital - Verify Your Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2c3e50;
      padding: 20px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0077be;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PayNomad Capital</h1>
  </div>
  <div class="content">
    <h2>Verify Your Email</h2>
    <p>Hello,</p>
    <p>Thank you for registering with PayNomad Capital. Please click the button below to verify your email address and complete your registration.</p>
    <p style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
    </p>
    <p>If you did not request this verification, please ignore this email.</p>
    <p>This link will expire in 24 hours.</p>
  </div>
  <div class="footer">
    <p>&copy; 2024 PayNomad Capital Ltd. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>'
WHERE flow_type = 'email_otp';

-- Set the email subject
UPDATE auth.config
SET email_template_subject = 'PayNomad Capital - Verify Your Email'
WHERE id = 1;

COMMIT;