'use strict';

/**
 * Users repository — all direct Sequelize access is contained here.
 * Models will be registered in a later phase.
 */

async function findAll() {
  // Placeholder: return usersModel.findAll()
  return [];
}

async function findById(_id) {
  // Placeholder: return usersModel.findByPk(id)
  return null;
}

async function create(_data) {
  // Placeholder: return usersModel.create(data)
  return null;
}

async function update(_id, _data) {
  // Placeholder: find and update
  return null;
}

async function remove(_id) {
  // Placeholder: destroy
}

module.exports = { findAll, findById, create, update, remove };
