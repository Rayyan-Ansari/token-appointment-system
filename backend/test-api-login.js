async function loginTest() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/patient/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'john.doe@example.com', password: 'patient123' })
        });
        const data = await res.json();
        console.log("Patient Login Result: ", data);
    } catch (e) {
        console.error(e);
    }
}
loginTest();
