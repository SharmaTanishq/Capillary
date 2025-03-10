import dotenv from 'dotenv';
import { Scheduler } from '../Jobs/Scheduler';

// Load environment variables
dotenv.config();

/**
 * Test script to verify the scheduler functionality
 */
async function testScheduler() {
    try {
        console.log('Testing scheduler...');
        
        // Get scheduler instance
        const scheduler = Scheduler.getInstance();
        
        // Start jobs
        console.log('Starting jobs...');
        await scheduler.startJobs();
        
        // Keep the process running for a while to observe the scheduler
        console.log('Scheduler is running. Press Ctrl+C to stop.');
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\nStopping scheduler...');
            scheduler.stopJobs();
            process.exit(0);
        });
    } catch (error) {
        console.error('Error in test script:', error);
    }
}

// Run the test
testScheduler(); 