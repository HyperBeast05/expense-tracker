export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Expense Tracker",
        email: process.env.SMTP_FROM,
      },
      to: [
        {
          email,
        },
      ],
      subject: "Reset Your Expense Tracker Password",
      textcontent: `You requested a password reset.

Click the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Expense Tracker account.</p>
          <p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:10px 18px;background:#0d6efd;color:white;text-decoration:none;border-radius:5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in <strong>15 minutes</strong>.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Brevo email error (${response.status}): ${errorDetails}`);
  }
};
