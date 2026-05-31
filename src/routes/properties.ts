import { Router, Request, Response } from 'express';
import { Property } from '../models/Property';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.json(properties);
    } catch {
        res.status(500).json({ error: 'Erro ao buscar imoveis' });
    }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Imovel nao encontrado' });
            return;
        }
        res.json(property);
    } catch {
        res.status(400).json({ error: 'ID invalido' });
    }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, address, price, area, bedrooms, bathrooms, garages, description, transactionType, image_url, photos } = req.body;

        if (!title || !address || price === undefined || !transactionType) {
            res.status(400).json({ error: 'Campos obrigatorios: title, address, price, transactionType' });
            return;
        }

        const property = new Property({
            title,
            address,
            price: Number(price),
            area: Number(area) || 0,
            bedrooms: Number(bedrooms) || 0,
            bathrooms: Number(bathrooms) || 0,
            garages: Number(garages) || 0,
            description: description || '',
            transactionType,
            image_url: image_url || '',
            photos: photos || [],
            owner: req.userEmail || req.uid || '',
        });

        const saved = await property.save();
        res.status(201).json(saved);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Erro ao cadastrar imovel' });
        }
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Imovel nao encontrado' });
            return;
        }
        if (property.owner !== req.userEmail && property.owner !== req.uid) {
            res.status(403).json({ error: 'Sem permissao para remover este imovel' });
            return;
        }
        await property.deleteOne();
        res.json({ message: 'Imovel removido' });
    } catch {
        res.status(400).json({ error: 'ID invalido' });
    }
});

export default router;
