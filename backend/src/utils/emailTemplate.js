export const forgotPasswordEmail = (otp) => {
  return {
    subject: "Your KineticOS Verification Code",

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verification Code</title>
        </head>

        <body style="margin: 0; padding: 0; background-color: #050507; font-family: Arial, sans-serif;">

          <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #111116; border-radius: 20px;">

            <div style="text-align: center;">

              <h1 style="color: #ffffff; margin-bottom: 10px;">
                Kinetic<span style="color: #8b5cf6;">OS</span>
              </h1>

              <p style="color: #a1a1aa; font-size: 14px;">
                Move better. Live smarter.
              </p>

            </div>

            <div style="margin-top: 35px;">

              <h2 style="color: #ffffff;">
                Reset your password
              </h2>

              <p style="color: #a1a1aa; line-height: 1.6;">
                We received a request to reset your KineticOS account password.
                Use the verification code below to complete the reset process.
              </p>

              <div style="text-align: center; margin: 30px 0;">

                <div
                  style="
                    display: inline-block;
                    padding: 16px 36px;
                    background-color: #18181f;
                    color: #ffffff;
                    letter-spacing: 10px;
                    font-size: 32px;
                    font-weight: 800;
                    border-radius: 12px;
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    box-shadow: 0 0 25px rgba(139, 92, 246, 0.2);
                  "
                >
                  ${otp}
                </div>

              </div>

              <p style="color: #71717a; font-size: 13px; line-height: 1.6;">
                This verification code will expire in 10 minutes.
              </p>

              <p style="color: #71717a; font-size: 13px; line-height: 1.6;">
                If you did not request a password reset, you can safely ignore
                this email.
              </p>

            </div>

            <div style="margin-top: 35px; border-top: 1px solid #27272a; padding-top: 20px; text-align: center;">

              <p style="color: #52525b; font-size: 12px;">
                © 2026 KineticOS. All rights reserved.
              </p>

            </div>

          </div>

        </body>
      </html>
    `,
  };
};