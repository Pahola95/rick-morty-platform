require('dotenv').config();
const { sequelize } = require('../src/config/db');
const User = require('../src/modules/users/user.model');

const makeAdmin = async (email) => {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log('❌ Usuario no encontrado:', email);
    process.exit(1);
  }

  await user.update({ role: 'ADMIN' });
  console.log(`✅ ${user.name} ahora es ADMIN`);
  process.exit(0);
};

makeAdmin(process.argv[2]);