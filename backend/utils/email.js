import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const info = await transporter.sendMail({
    from: `"Expense Tracker" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Reset Your Expense Tracker Password",
    text: `You requested a password reset.

    Click the following link to reset your password:

    ${resetUrl}

    This link will expire in 15 minutes.

    If you did not request a password reset, you can safely ignore this email.`,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Reset Your Password</h2>

            <p>You requested a password reset for your Expense Tracker account.</p>

            <p>
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        padding: 10px 18px;
                        background: #0d6efd;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        "
                >
                    Reset Password
                </a>
            </p>

            <p>This link will expire in <strong>15 minutes</strong>.</p>

            <p>
                If you did not request a password reset, you can safely ignore this email.
            </p>
        </div>
        `,
  });
};
