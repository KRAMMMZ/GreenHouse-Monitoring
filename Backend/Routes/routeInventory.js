import { Router } from 'express';
import { InventoryContainer, InventoryItem } from '../Controller/InventoryController.js';

const router = Router();

router.get('/inventory', InventoryItem);
router.get('/inventory_container', InventoryContainer);
 
export default router;
