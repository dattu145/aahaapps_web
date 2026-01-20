const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY is missing');
        throw new Error('Server email configuration missing');
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    // IMPORTANT: Use a verified sender from Brevo. Gmail addresses won't work due to DMARC.
    // For production: Verify your domain (aahaapps.com) in Brevo and set up DNS records (SPF, DKIM, DMARC)
    sendSmtpEmail.sender = { email: 'admin@aahaapps.com', name: 'AahaApps Admin' };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    try {
        console.log(`Sending email to: ${to} with subject: ${subject}`);
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Brevo API Response:', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        if (error.response) {
            console.error('Brevo API Error Response:', JSON.stringify(error.response.body));
        }
        throw error;
    }
};

module.exports = { sendEmail };
