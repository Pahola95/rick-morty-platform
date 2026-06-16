const userRepository = require('./user.repository');

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const updateRole = async (id, role) => {
  const validRoles = ['ADMIN', 'USER'];
  if (!validRoles.includes(role)) {
    throw { status: 400, message: 'Rol inválido' };
  }
  const user = await userRepository.findById(id);
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };
  return await userRepository.updateRole(id, role);
};

const deleteUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };
  await userRepository.deleteUser(id);
  return { message: 'Usuario eliminado' };
};

const getProfile = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };
  return user;
};

module.exports = { getAllUsers, updateRole, deleteUser, getProfile };