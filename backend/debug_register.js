const { register } = require('./src/services/authService');
const { sequelize } = require('./src/config/database');

async function testRegister() {
  try {
    console.log("Testing registration service...");
    const userData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test' + Date.now() + '@example.com',
      password: 'Password123!'
    };
    
    const user = await register(userData);
    console.log("Registration successful!", user);
  } catch (error) {
    console.error("Registration failed!");
    console.error("Error Message:", error.message);
    if (error.errors) {
      console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
    }
  } finally {
    process.exit(0);
  }
}

testRegister();
