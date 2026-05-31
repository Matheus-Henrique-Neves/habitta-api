import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import propertiesRouter from './routes/properties';
import favoritesRouter from './routes/favorites';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/properties', propertiesRouter);
app.use('/favorites', favoritesRouter);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

async function start(): Promise<void> {
    initializeFirebase();
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

start().catch((err) => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
});
