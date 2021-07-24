import { Router } from 'express';
import SongDataGetEndpoint from './get';

const router = Router();

router.get('/', SongDataGetEndpoint.getAll);

export default router;
