import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ip from 'ip';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/getActiveCoupons', async (req: Request, res: Response) => {
    try {
        // TODO: Implement coupon logic
        res.json({ message: 'Get Active Coupons endpoint' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/memberRewards/:rewardId/redeem', async (req: Request, res: Response) => {
    try {
        const { rewardId } = req.params;
        // TODO: Implement reward redemption logic
        res.json({ message: `Redeem reward with ID: ${rewardId}` });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/memberRewards/:rewardId/unredeem', async (req: Request, res: Response) => {
    try {
        const { rewardId } = req.params;
        // TODO: Implement reward unredemption logic
        res.json({ message: `Unredeem reward with ID: ${rewardId}` });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Server setup
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on http://${ip.address()}:${PORT}`);
});
