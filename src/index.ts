import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ip from 'ip';
import { CouponService } from './Capillary/Rewards';

// Load environment variables
dotenv.config();

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
router.get('/getActiveCoupons', async (req: any, res: any) => {
    try {
        const email = req.query.email as string;
        
        if (!email) {
            return res.status(400).json({ error: 'Member email is required' });
        }
        
        const couponService = await CouponService.create();
        const coupons = await couponService.getActiveCoupons(email);
        
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/memberRewards/:rewardId/redeem', async (req: any, res: any) => {
    try {
        const { rewardId } = req.params;
        
        if (!rewardId) {
            return res.status(400).json({ error: 'Reward ID is required' });
        }
        
        const couponService = await CouponService.create();
        const result = await couponService.redeemCoupon(rewardId);
        
        res.json(result);
    } catch (error) {
        console.error('Error redeeming reward:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/memberRewards/:rewardId/unredeem', async (req: any, res: any) => {
    try {
        const { rewardId } = req.params;
        
        if (!rewardId) {
            return res.status(400).json({ error: 'Reward ID is required' });
        }
        
        const couponService = await CouponService.create();
        const result = await couponService.unredeemCoupon(rewardId);
        
        res.json(result);
    } catch (error) {
        console.error('Error unredeeming reward:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Use the router
app.use('/api', router);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://${ip.address()}:${PORT}`);
});
