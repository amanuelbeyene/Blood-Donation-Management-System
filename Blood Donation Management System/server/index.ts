import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import donorRoutes from './routes/donorRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import requestRoutes from './routes/requestRoutes';
import donationRoutes from './routes/donationRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admins', adminRoutes);

app.get('/', (req, res) => {
    res.send('Blood Donation Management System API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
