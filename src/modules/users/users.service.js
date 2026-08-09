'use strict';

const usersRepository = require('./users.repository');

async function getAll() {
  return usersRepository.findAll();
}

async function getById(id) {
  return usersRepository.findById(id);
}

async function create(data) {

  return usersRepository.create(data);
}

async function update(id, data) {
  return usersRepository.update(id, data);
}

async function remove(id) {
  return usersRepository.remove(id);
}

module.exports = { getAll, getById, create, update, remove };