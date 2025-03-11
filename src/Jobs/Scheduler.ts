import * as schedule from 'node-schedule';
import { TokenService } from '../Capillary/TokenService';
import { sendOrderDetails } from '../Capillary/Transactions/SendOrderDetails';
import { getFulFilledOrders, getOrderDetailsById } from '../KIBO/OrderDetails';
import { CommerceRuntimeOrderItem } from '@kibocommerce/rest-sdk/clients/Commerce';

export class Scheduler {
    private static instance: Scheduler;
    private isRunning: boolean = false;
    private jobs: schedule.Job[] = [];

    private constructor() {}

    public static getInstance(): Scheduler {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }

    /**
     * Start all scheduled jobs
     */
    public async startJobs() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }

        console.log('Starting scheduler jobs...');
        this.isRunning = true;

        // Get token service instance
        const tokenService = TokenService.getInstance();

        // Schedule order sync job (every 2 minutes)
        this.jobs.push(
            schedule.scheduleJob('*/2 * * * *', async () => {
                try {
                    console.log('Running order sync job...');
                    const token = await tokenService.getToken();
                    
                    // TODO: Replace with actual order fetching logic
                    const orders = await getFulFilledOrders();

                    if(!orders.synthesized.items) return;
                    
                    
                    await Promise.all(orders.synthesized.items.map(async (order) => {
                        try {
                            console.log(`Processing order ${order.id}...`);
                            const matchingSynthesizedOrders = orders.synthesized.items?.filter(synth => synth.id === order.id);
                            const synthesizedItems:CommerceRuntimeOrderItem[] = matchingSynthesizedOrders?.[0]?.items || [];
                            const result = await sendOrderDetails(order,synthesizedItems);
                            if (result.success) {
                                console.log(`Successfully processed order ${order.id}`);
                                // TODO: Mark order as processed
                            } else {
                                console.error(`Failed to process order ${order.id}:`, result.message);
                                // TODO: Add to failed orders queue
                            }
                        } catch (error) {
                            console.error(`Error processing order ${order.id}:`, error);
                        }
                    }));
                } catch (error) {
                    console.error('Error in order sync job:', error);
                }
            })
        );

        // Schedule failed orders retry job (every 30 minutes)
        // this.jobs.push(
        //     schedule.scheduleJob('*/30 * * * *', async () => {
        //         try {
        //             console.log('Running failed orders retry job...');
        //             const token = await tokenService.getToken();
                    
        //             // TODO: Replace with actual failed orders fetching logic
        //             const failedOrders = await this.getFailedOrders();
                    
        //             await Promise.all(failedOrders.map(async (orderId) => {
        //                 try {
        //                     console.log(`Retrying failed order ${orderId}...`);
        //                     const result = await sendOrderDetails(orderId);
        //                     if (result.success) {
        //                         console.log(`Successfully processed failed order ${orderId}`);
        //                         // TODO: Remove from failed orders queue
        //                     } else {
        //                         console.error(`Failed to process order ${orderId} again:`, result.message);
        //                     }
        //                 } catch (error) {
        //                     console.error(`Error processing failed order ${orderId}:`, error);
        //                 }
        //             }));
        //         } catch (error) {
        //             console.error('Error in failed orders retry job:', error);
        //         }
        //     })
        // );

        console.log('All jobs scheduled successfully');
    }

    /**
     * Stop all scheduled jobs
     */
    public stopJobs() {
        console.log('Stopping scheduler jobs...');
        this.jobs.forEach(job => job.cancel());
        this.jobs = [];
        this.isRunning = false;
        console.log('All jobs stopped');
    }

    /**
     * Get list of unprocessed orders
     * TODO: Implement actual logic to fetch unprocessed orders
     */
  

    /**
     * Get list of failed orders
     * TODO: Implement actual logic to fetch failed orders
     */

}
