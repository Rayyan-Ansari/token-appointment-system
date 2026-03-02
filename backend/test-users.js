const bcrypt = require('bcrypt');

async function test() {
    const hash = '$2b$12$MTQhVPvGUdOY22In0rdqCu5Wa5/zVLF2bFZ9LBtIVH.BYqK.gibZy';
    const isValid = await bcrypt.compare('patient123', hash);
    console.log("Is patient123 valid for hash? ", isValid);
}

test();
