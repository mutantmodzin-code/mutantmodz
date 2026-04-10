const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

function getResend() {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
}

// POST /api/contact — sends contact form submission to admin email
router.post('/', async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const adminEmail = process.env.ADMIN_CONTACT_EMAIL || 'info@mutantmodz.in';
    const fromEmail  = process.env.RESEND_FROM_EMAIL  || 'onboarding@resend.dev';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; padding: 32px; border-radius: 12px;">
            <div style="border-bottom: 3px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #dc2626; font-size: 24px; margin: 0;">MUTANT MODZ</h1>
                <p style="color: #888; margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">New Contact Form Submission</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 120px;">Name</td>
                    <td style="padding: 10px 0; color: #fff; font-weight: bold;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
                    <td style="padding: 10px 0; color: #fff; font-weight: bold;"><a href="mailto:${email}" style="color: #dc2626;">${email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
                    <td style="padding: 10px 0; color: #fff; font-weight: bold;">${phone || 'Not provided'}</td>
                </tr>
            </table>

            <div style="margin-top: 24px; background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">Message</p>
                <p style="color: #fff; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #444; font-size: 11px; margin-top: 32px; text-align: center;">
                This message was sent from the Mutant Modz contact form at mutantmodz.in
            </p>
        </div>
    `;

    const resend = getResend();
    if (!resend) {
        // Dev mode — just log it
        console.log('\n📩 CONTACT FORM SUBMISSION (Mock Mode):');
        console.log('  Name:', name);
        console.log('  Email:', email);
        console.log('  Phone:', phone);
        console.log('  Message:', message);
        console.log('-------------------------------------------\n');
        return res.json({ success: true, dev: true });
    }

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to: [adminEmail],
            replyTo: email,
            subject: `📩 New Contact from ${name} — Mutant Modz`,
            html
        });

        if (error) {
            console.error('RESEND ERROR (contact):', error);
            return res.status(500).json({ error: 'Failed to send email. Please try again.' });
        }

        console.log(`✓ Contact form email sent from ${email} to ${adminEmail}`);
        res.json({ success: true });
    } catch (err) {
        console.error('CONTACT ROUTE ERROR:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

module.exports = router;
