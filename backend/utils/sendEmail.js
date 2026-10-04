const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Study Assistant <onboarding@resend.dev>",
      to,
      subject,
      text,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;