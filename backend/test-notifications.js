const { io } = require("socket.io-client");

async function runTest() {
    console.log("Testing Notifications...");

    // 1. Login as Patient
    const patientRes = await fetch('http://localhost:5000/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'john.doe@example.com', password: 'patient123' })
    });
    const patientData = await patientRes.json();
    console.log("Patient Auth:", patientData.success ? "Success" : "Failed");
    const patientToken = patientData.data.token;

    // 2. Patient connects to socket with handshake auth token
    const socket = io('http://localhost:5000', {
        auth: { token: patientToken }
    });

    socket.on('connect', () => {
        console.log("Patient Socket Connected!");
    });

    socket.on('authenticated', (data) => {
        console.log("Patient Socket Authenticated event:", data);
    });

    let notificationReceived = false;
    socket.on('mytoken:updated', (data) => {
        console.log("NOTIFICATION RECEIVED! mytoken:updated =>", data);
        notificationReceived = true;
        if (data.status === 'CALLED') {
            console.log("SUCCESS: Notification for CALLED token received!");
            setTimeout(() => process.exit(0), 1000); // Test passed
        }
    });

    // Wait a bit for socket connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Login as Doctor
    const docRes = await fetch('http://localhost:5000/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dr.wilson@example.com', password: 'doctor123' })
    });
    const docData = await docRes.json();
    console.log("Doctor Auth:", docData.success ? "Success" : docData);
    const docToken = docData.data.token;

    // 4. Doctor calls Next Token
    const nextTokenRes = await fetch('http://localhost:5000/api/doctors/session/next', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${docToken}`
        }
    });

    const nextTokenData = await nextTokenRes.json();
    console.log("Next Token Result:", nextTokenData);

    // Wait to see if notification arrives
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!notificationReceived) {
        console.error("FAIL: Notification was not received within timeout.");
        process.exit(1);
    }
}

runTest().catch(console.error);
