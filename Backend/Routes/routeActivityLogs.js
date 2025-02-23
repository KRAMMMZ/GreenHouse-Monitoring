import { Router } from 'express';
import { AdminLogs, UserLogs, RejectionLogs, MaintenanceLogs } from '../Controller/LogsController.js';

const router = Router();

router.get('/admin', AdminLogs);
router.get('/user', UserLogs);
router.get('/rejection', RejectionLogs);
router.get('/maintenance', MaintenanceLogs);

export default router;
