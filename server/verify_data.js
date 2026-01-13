const db = require('./config/db');

const verify = async () => {
    try {
        console.log('Verifying connected database...');

        const [users] = await db.query('SELECT * FROM users');
        const [pages] = await db.query('SELECT * FROM pages');
        const [menuItems] = await db.query('SELECT * FROM menu_items');

        console.log(`--- DATA REPORT ---`);
        console.log(`Users Count: ${users.length}`);
        console.log(`Pages Count: ${pages.length}`);
        console.log(`Menu Items Count: ${menuItems.length}`);

        if (users.length > 0) {
            console.log('User Sample:', users[0].name, users[0].email);
        } else {
            console.log('WARNING: Users table is empty!');
        }

        process.exit(0);
    } catch (e) {
        console.error('Verification failed:', e.message);
        process.exit(1);
    }
};

verify();
