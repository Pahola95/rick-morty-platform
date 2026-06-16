require('dotenv').config();
const { sequelize } = require('../src/config/db');
const User = require('../src/modules/users/user.model');

const changeRole = async (email, role) => {
  if (!email || !role) {
    console.log('❌ Uso: node scripts/changeRole.js EMAIL ROLE');
    console.log('   Roles válidos: ADMIN, USER');
    process.exit(1);
  }

  if (!['ADMIN', 'USER'].includes(role)) {
    console.log('❌ Rol inválido. Usa ADMIN o USER');
    process.exit(1);
  }

  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log('❌ Usuario no encontrado:', email);
    process.exit(1);
  }

  await user.update({ role });
  console.log(`✅ ${user.name} ahora es ${role}`);
  process.exit(0);
};

changeRole(process.argv[2], process.argv[3]);