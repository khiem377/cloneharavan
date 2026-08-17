const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');


const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};


const updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  Object.assign(user, updateData);
  await user.save();
  return user;
};


const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

module.exports = { getUserById, updateUser, deleteUser };

