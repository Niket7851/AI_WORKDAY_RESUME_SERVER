'use strict';

const { Router } = require('express');

const { sendSuccess, sendError } = require('../shared/utils');
const { verifyConnection } = require('../database');

const usersRoutes = require('../modules/users/users.routes');
const resumesRoutes = require('../modules/resumes/resumes.routes');
const applicationsRoutes = require('../modules/applications/applications.routes');
const stepsRoutes = require('../modules/applications/steps.routes');
const fieldsRoutes = require('../modules/applications/fields.routes');
const mappingRoutes = require('../modules/mapping/mapping.routes');
const automationRoutes = require('../modules/automation/automation.routes');
const aiRoutes = require('../modules/ai/ai.routes');

const router = Router();

router.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';

  try {
    await verifyConnection();
    dbStatus = 'connected';
  } catch {

  }

  const isHealthy = dbStatus === 'connected';

  return sendSuccess(
    res,
    {
      status: isHealthy ? 'ok' : 'degraded',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: { status: dbStatus },
    },
    isHealthy ? 200 : 503
  );
});

router.use('/users', usersRoutes);
router.use('/resumes', resumesRoutes);
router.use('/applications', applicationsRoutes);
router.use('/steps', stepsRoutes);
router.use('/fields', fieldsRoutes);
router.use('/mapping', mappingRoutes);
router.use('/automation', automationRoutes);
router.use('/ai', aiRoutes);

router.use((_req, res) => {
  sendError(res, 'Not found', 404, 'NOT_FOUND');
});

module.exports = router;