'use strict';

const { User } = require('../../database');

async function findAll() {
  return User.findAll({ order: [['createdAt', 'DESC']] });
}

async function findById(id) {
  return User.findByPk(id);
}

async function findOrCreateById(id) {
  const [user] = await User.findOrCreate({
    where: { id },
    defaults: {
      id,

      email: `anon-${id}@extension.local`,
      name: 'Extension User',
    },
  });
  return user;
}

async function create(data) {
  return User.create(data);
}

async function update(id, data) {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update(data);
}

async function remove(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
}

module.exports = { findAll, findById, findOrCreateById, create, update, remove };