import express, { Request, Response } from 'express';
const router = express.Router();

router.get('/hotels', async (req: Request, res: Response) => {
  res.json([]);
});
router.get('/buses', async (req: Request, res: Response) => {
  res.json([]); 
});
router.get('/cars', async (req: Request, res: Response) => {
  res.json([]);
});
router.get('/trains', async (req: Request, res: Response) => {
  res.json([]);
});
router.get('/flights', async (req: Request, res: Response) => {
  res.json([]);
});

export default router;
