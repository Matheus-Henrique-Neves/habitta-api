import { Router, Request, Response } from 'express';
import { Property } from '../models/Property';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 10));
        const skip = (page - 1) * limit;

        const [properties, total] = await Promise.all([
            Property.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Property.countDocuments(),
        ]);

        res.json({
            properties,
            page,
            limit,
            total,
            hasMore: skip + properties.length < total,
        });
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
        const { title, address, price, area, bedrooms, bathrooms, garages, description, transactionType, image_url, photos, contactEmail, contactPhone } = req.body;

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
            contactEmail: contactEmail || req.userEmail || '',
            contactPhone: contactPhone || '',
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

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Imovel nao encontrado' });
            return;
        }
        if (property.owner !== req.userEmail && property.owner !== req.uid) {
            res.status(403).json({ error: 'Sem permissao para editar este imovel' });
            return;
        }

        const campos = ['title', 'address', 'price', 'area', 'bedrooms', 'bathrooms', 'garages', 'description', 'transactionType', 'image_url', 'photos', 'contactEmail', 'contactPhone'];
        for (const campo of campos) {
            if (req.body[campo] !== undefined) {
                (property as unknown as Record<string, unknown>)[campo] = req.body[campo];
            }
        }

        const atualizado = await property.save();
        res.json(atualizado);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'ID invalido' });
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
