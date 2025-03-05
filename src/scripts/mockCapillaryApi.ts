import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockCoupons = {
  // Empty coupons for shokri@wooomail.com
  'shokri@wooomail.com': [],
  
  // Some coupons for test@example.com
  'test@example.com': [
    {
      memberRewardId: '12345',
      dateIssued: '2023-01-01T00:00:00Z',
      displayName: 'Test Reward'
    },
    {
      memberRewardId: '67890',
      dateIssued: '2023-02-01T00:00:00Z',
      displayName: '$5 Reward'
    }
  ]
};

// Mock authentication endpoint
app.post('/v3/oauth/token/generate', (req, res) => {
  const { key, secret } = req.body;
  
  // Accept any credentials for testing
  res.json({
    data: {
      accessToken: 'mock-token-for-testing-purposes-only',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
  });
});

// Mock coupons endpoint
app.get('/v2/customers/coupons', (req, res) => {
  const email = req.query.email as string;
  
  if (!email) {
    return res.status(400).json({
      errors: [{ code: 400, message: 'Email is required' }]
    });
  }
  
  // Return coupons for the email or empty array if not found
  const coupons = mockCoupons[email] || [];
  
  res.json({
    data: coupons
  });
});

// Mock redeem endpoint
app.patch('/api/v1/loyalty/memberRewards/:rewardId/redeem', (req, res) => {
  const { rewardId } = req.params;
  
  res.json({
    data: {
      memberRewardId: rewardId,
      status: 'Redeemed',
      message: 'Reward redeemed successfully'
    }
  });
});

// Mock unredeem endpoint
app.patch('/api/v1/loyalty/memberRewards/:rewardId/unredeem', (req, res) => {
  const { rewardId } = req.params;
  
  res.json({
    data: {
      memberRewardId: rewardId,
      status: 'Unredeemed',
      message: 'Reward unredeemed successfully'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock Capillary API running at http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`- POST http://localhost:${PORT}/v3/oauth/token/generate`);
  console.log(`- GET http://localhost:${PORT}/v2/customers/coupons?email=<email>&status=Active_Unredeemed`);
  console.log(`- PATCH http://localhost:${PORT}/api/v1/loyalty/memberRewards/:rewardId/redeem`);
  console.log(`- PATCH http://localhost:${PORT}/api/v1/loyalty/memberRewards/:rewardId/unredeem`);
  console.log(`\nTest emails:`);
  console.log(`- shokri@wooomail.com (no coupons)`);
  console.log(`- test@example.com (has coupons)`);
}); 