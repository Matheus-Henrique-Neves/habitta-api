import { Router, Response } from 'express';
import { Favorite } from '../models/Favorite';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:userId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.uid !== req.params.userId && req.userEmail !== req.params.userId) {
        res.status(403).json({ error: 'Sem permissao' });
        return;
    }
    try {
        const favorite = await Favorite.findOne({ userId: req.params.userId });
        res.json({ propertyIds: favorite?.propertyIds || [] });
    } catch {
        res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
});

router.post('/add', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { propertyId } = req.body;
    if (!propertyId) {
        res.status(400).json({ error: 'propertyId e obrigatorio' });
        return;
    }
    try {
        const userId = req.uid!;
        await Favorite.findOneAndUpdate(
            { userId },
            { $addToSet: { propertyIds: propertyId } },
            { upsert: true, new: true }
        );
        res.json({ message: 'Favorito adicionado' });
    } catch {
        res.status(500).json({ error: 'Erro ao adicionar favorito' });
    }
});

router.post('/remove', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const { propertyId } = req.body;
    if (!propertyId) {
        res.status(400).json({ error: 'propertyId e obrigatorio' });
        return;
    }
    try {
        const userId = req.uid!;
        await Favorite.findOneAndUpdate(
            { userId },
            { $pull: { propertyIds: propertyId } }
        );
        res.json({ message: 'Favorito removido' });
    } catch {
        res.status(500).json({ error: 'Erro ao remover favorito' });
    }
});

export default router;
