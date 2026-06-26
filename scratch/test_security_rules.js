const {
    calculateRiskScore,
    isDatacenterIP,
    checkImpossibleTravel,
    checkPwnedPassword,
    getGeoIPData
} = require('../server/utils/security');

async function testAll() {
    console.log('=== STARTING ENTERPRISE SECURITY RULES TESTS ===');

    // 1. Have I Been Pwned checks
    console.log('\n--- 1. Testing Password Breach Detection (HIBP) ---');
    const breached = await checkPwnedPassword('password123');
    console.log(`Password 'password123' breached: ${breached.isBreached} (Count: ${breached.count})`);

    const safe = await checkPwnedPassword('XyZ9$@1aB2c3D4e5F6');
    console.log(`Complex password 'XyZ9$@1aB2c3D4e5F6' breached: ${safe.isBreached}`);

    // 2. Datacenter detection
    console.log('\n--- 2. Testing Datacenter IP Detection ---');
    const dcGeo = { isp: 'Amazon.com, Inc.', org: 'AWS Cloud Infrastructure' };
    const normalGeo = { isp: 'Reliance Jio Infocomm Limited', org: 'Jio Mobile Network' };
    console.log(`AWS geo record detected as datacenter: ${isDatacenterIP(dcGeo)}`);
    console.log(`Jio geo record detected as datacenter: ${isDatacenterIP(normalGeo)}`);

    // 3. GeoIP fallback resolution
    console.log('\n--- 3. Testing GeoIP Localhost Fallback ---');
    const localGeo = await getGeoIPData('127.0.0.1');
    console.log(`Localhost IP Geolocation:`, JSON.stringify(localGeo));

    // 4. Risk Score aggregation
    console.log('\n--- 4. Testing Risk Score Engine Thresholds ---');
    const threatRisk = await calculateRiskScore({
        isVPN: true,
        isDatacenter: true,
        isNonIndia: true,
        isBot: true
    });
    console.log(`Aggregated risk score: ${threatRisk.score}`);
    console.log(`Triggered reasons:`, threatRisk.reasons);

    const normalRisk = await calculateRiskScore({
        isNewDevice: true
    });
    console.log(`Normal customer new device risk score: ${normalRisk.score}`);

    console.log('\n=== COMPLETED SECURITY TESTS ===');
    process.exit(0);
}

testAll().catch(e => {
    console.error('Test run error:', e);
    process.exit(1);
});
