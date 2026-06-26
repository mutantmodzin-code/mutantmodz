async function runTest() {
    const payload = {
        phone: '9342637975',
        email: 'dineshdharnesh03@gmail.com',
        captchaToken: '0x4AAAAAADpJUtqpn-0QM822DIlDjvOJp7Y',
        website: '',
        browserFingerprint: 'test-fingerprint',
        deviceMetadata: {
            deviceId: 'test-device-id',
            browser: 'Mozilla/5.0',
            timezone: 'Asia/Kolkata',
            language: 'en-IN',
            screenResolution: '1920x1080'
        },
        behavioralProfile: {
            isActive: true,
            mouseMoves: 10,
            scrollEvents: 5,
            keyboardTimings: [100, 120, 110],
            pasteDetected: false
        }
    };

    console.log('Sending send-otp request to http://localhost:3001...');
    try {
        const res = await fetch('http://localhost:3001/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
runTest();
