const svc = require('../services/role.service');

const getPermissions = async (req, res, next) => {
  try {
    res.json(await svc.getAllPermissions());
  } catch (e) {
    next(e);
  }
};

const getRoles = async (req, res, next) => {
  try {
    res.json(await svc.getAllRoles());
  } catch (e) {
    next(e);
  }
};

const getRole = async (req, res, next) => {
  try {
    res.json(await svc.getRoleById(req.params.id));
  } catch (e) {
    next(e);
  }
};

const createRole = async (req, res, next) => {
  try {
    res.status(201).json(await svc.createRole(req.body));
  } catch (e) {
    next(e);
  }
};

const updateRole = async (req, res, next) => {
  try {
    res.json(await svc.updateRole(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    res.json(await svc.deleteRole(req.params.id));
  } catch (e) {
    next(e);
  }
};

const assignUserRole = async (req, res, next) => {
  try {
    const { roleId, customPermissions } = req.body;
    res.json(await svc.assignUserRole(req.params.userId, roleId, customPermissions));
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getPermissions,
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignUserRole,
};
