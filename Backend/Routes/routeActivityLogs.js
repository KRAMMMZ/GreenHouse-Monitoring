import { Router } from 'express';
import { 
  AdminLogs, 
  UserLogs, 
  RejectionLogs, 
  MaintenanceLogs, 
  HarvestLogs, 
  HardwareComponentsLogs, 
  //HardwareStatusLogs,
  ControlsLog,
  InventoryItemLogs,
  PlantedCropsLogs
} from '../Controller/LogsController.js';

const router = Router();

router.get('/admin', AdminLogs);
router.get('/user', UserLogs);
router.get('/rejection', RejectionLogs);
router.get('/maintenance', MaintenanceLogs);
router.get('/harvest', HarvestLogs);
router.get('/hardware_components', HardwareComponentsLogs);
//router.get('/hardware_status', HardwareStatusLogs);
router.get('/control/logsd', ControlsLog);
router.get('/inventory', InventoryItemLogs);
router.get('/planted_crops', PlantedCropsLogs);

export default router;
