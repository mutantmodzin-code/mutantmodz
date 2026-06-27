/**
 * MailerSend REST API Wrapper client.
 * Drops in as a replacement for the Resend SDK.
 */
class MailerSend {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.emails = {
            send: async ({ from, to, replyTo, subject, text, html }) => {
                try {
                    // Format 'from'
                    const formattedFrom = typeof from === 'string' ? { email: from } : from;

                    // Format 'to' (MailerSend requires an array of objects)
                    let formattedTo = [];
                    if (Array.isArray(to)) {
                        formattedTo = to.map(item => {
                            if (typeof item === 'string') {
                                return { email: item.trim() };
                            }
                            if (item && typeof item === 'object' && item.email) {
                                return { email: item.email.trim(), name: item.name };
                            }
                            return item;
                        });
                    } else if (typeof to === 'string') {
                        formattedTo = [{ email: to.trim() }];
                    }

                    // Build JSON payload
                    const payload = {
                        from: formattedFrom,
                        to: formattedTo,
                        subject: subject,
                        text: text,
                        html: html
                    };

                    // Format 'replyTo' (maps to 'reply_to' in MailerSend API)
                    if (replyTo) {
                        payload.reply_to = typeof replyTo === 'string' ? { email: replyTo.trim() } : replyTo;
                    }

                    const response = await fetch('https://api.mailersend.com/v1/email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorDetails = await response.text();
                        console.error(`❌ MailerSend API Error: ${response.status} - ${errorDetails}`);
                        return {
                            data: null,
                            error: {
                                message: `MailerSend API responded with status ${response.status}: ${errorDetails}`,
                                status: response.status
                            }
                        };
                    }

                    // MailerSend sends a 202 Accepted status on success with empty/minimal response body
                    let responseData = {};
                    try {
                        responseData = await response.json();
                    } catch (e) {
                        // Response might not be JSON or might be empty
                    }

                    return {
                        data: { id: responseData.message_id || response.headers.get('X-Message-Id') || 'mailersend-success-id' },
                        error: null
                    };
                } catch (err) {
                    console.error('❌ MailerSend sending exception:', err);
                    return {
                        data: null,
                        error: {
                            message: err.message || 'Unknown network/fetch error'
                        }
                    };
                }
            }
        };
    }
}

module.exports = { MailerSend };
