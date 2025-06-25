import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ip from 'ip';
import { CouponService } from './Capillary/Rewards';
import { Scheduler } from './Jobs/Scheduler';
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

router.get('/memberRewards/redeem/:redeemId&:orderId', async (req: any, res: any) => {
    try {
        const { redeemId,orderId } = req.params;
        
        if (!redeemId || !orderId) {
            return res.status(400).json({ error: 'Reward ID is required' });
        }

        const couponService = await CouponService.create();
        const result = await couponService.redeemCoupon({code:redeemId,orderId});
        
        res.json(result);
    } catch (error) {
        console.error('Error redeeming reward:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/memberRewards/unredeem/:redemptionId&:orderId', async (req: any, res: any) => {
    try {
        const { redemptionId,orderId } = req.params;
        
        if (!redemptionId) {
            return res.status(400).json({ error: 'Reward ID is required' });
        }
        console.log("Redemption ID",redemptionId);
        const couponService = await CouponService.create();
        const result = await couponService.unredeemCoupon({redemptionId,orderId});
        
        res.json(result);
    } catch (error) {
        console.error('Error unredeeming reward:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Capillary Integration API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Send order details to Capillary
router.post('/sendOrderToCapillary', async (req: any, res: any) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    const { sendOrderDetails } = require('./Capillary/Transactions/SendOrderDetails');
    const result = await sendOrderDetails(orderId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sending order to Capillary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Use the router
app.use('/api', router);

// Debug route at root path
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API server is running',
    availableRoutes: [
      '/api/health',
      '/api/memberRewards/:rewardId/redeem',
      '/api/memberRewards/:rewardId/unredeem',
      '/api/getActiveCoupons?email=user@example.com',
      '/api/sendOrderToCapillary (POST)'
    ]
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://${ip.address()}:${PORT}`);
    
    // Start scheduler if enabled
    if (process.env.SCHEDULER_RUNNING === 'true') {
          
        const scheduler = Scheduler.getInstance();
        await scheduler.startJobs();
        console.log('Scheduler started successfully');
    }
    
    // Debug: Log all registered routes
    console.log('\nRegistered Routes:');
    // @ts-ignore - Using internal Express properties for debugging
    app._router.stack.forEach((middleware: any) => {
        if(middleware.route) { // routes registered directly on the app
            console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
        } else if(middleware.name === 'router') { // router middleware
            // @ts-ignore - Using internal Express properties for debugging
            middleware.handle.stack.forEach((handler: any) => {
                if(handler.route) {
                    const path = handler.route.path;
                    const methods = Object.keys(handler.route.methods);
                    console.log(`${methods} /api${path}`);
                }
            });
        }
    });
});
