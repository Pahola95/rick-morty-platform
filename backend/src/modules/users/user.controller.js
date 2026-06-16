const userService = require('./user.service');

const getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const updateRole = async (req, res, next) => {
  try {
    const data = await userService.updateRole(req.params.id, req.body.role);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const data = await userService.deleteUser(req.params.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getAllUsers, updateRole, deleteUser, getProfile };