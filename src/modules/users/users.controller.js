'use strict';

const usersService = require('./users.service');
const { sendSuccess, sendError, asyncHandler } = require('../../shared/utils');

const getAll = asyncHandler(async (_req, res) => {
  const users = await usersService.getAll();
  sendSuccess(res, users);
});

const getById = asyncHandler(async (req, res) => {
  const user = await usersService.getById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404, 'NOT_FOUND');
  sendSuccess(res, user);
});

const create = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);
  sendSuccess(res, user, 201);
});

const update = asyncHandler(async (req, res) => {
  const user = await usersService.update(req.params.id, req.body);
  if (!user) return sendError(res, 'User not found', 404, 'NOT_FOUND');
  sendSuccess(res, user);
});

const remove = asyncHandler(async (req, res) => {
  await usersService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { getAll, getById, create, update, remove };
