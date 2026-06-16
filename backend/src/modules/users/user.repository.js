const User = require('./user.model');

const findByAuth0Id = async (auth0Id) => {
  return await User.findOne({ where: { auth0Id } });
};

const findById = async (id) => {
  return await User.findByPk(id, { attributes: { exclude: [] } });
};

const createUser = async (data) => {
  return await User.create(data);
};

const findAll = async () => {
  return await User.findAll();
};

const updateRole = async (id, role) => {
  await User.update({ role }, { where: { id } });
  return findById(id);
};

const deleteUser = async (id) => {
  return await User.destroy({ where: { id } });
};

module.exports = { findByAuth0Id, findById, createUser, findAll, updateRole, deleteUser };