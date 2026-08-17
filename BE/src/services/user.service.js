const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');

/**
 * Get user by ID (internal service)
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * Update user profile
 * 
 */
const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * Delete user
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

module.exports = { getUserById, updateUser, deleteUser };

