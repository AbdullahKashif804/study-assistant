const sendEmail = async (to, subject, text) => {
    try {
        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: {
                        name: process.env.BREVO_SENDER_NAME || "AI Study Assistant",
                        email: process.env.BREVO_SENDER_EMAIL
                    },
                    to: [{ email: to }],
                    subject,
                    textContent: text
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Brevo API error:", response.status, data.code);
            throw new Error("Email sending failed");
        }

        return data;

    } catch (error) {
        console.error("Email service error:", error.message);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;
