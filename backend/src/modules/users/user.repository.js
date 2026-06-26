const User = require('./user.model');

const findByAuth0Id = async (auth0Id) => {
  return await User.findOne({ auth0Id });
};

const findById = async (id) => {
  return await User.findById(id);
};

const createUser = async (data) => {
  return await User.create(data);
};

const findAll = async () => {
  return await User.find();
};

const updateRole = async (id, role) => {
  return await User.findByIdAndUpdate(id, { role }, { new: true });
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = { findByAuth0Id, findById, createUser, findAll, updateRole, deleteUser };
