
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the admin password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    rl.close();
    return;
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      console.log('Hashed password:', hash);
      console.log('\nNow, copy this hash and set it as the ADMIN_PASSWORD_HASH environment variable.');
    }
    rl.close();
  });
});
