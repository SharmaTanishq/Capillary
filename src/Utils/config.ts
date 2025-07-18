import dotenv from "dotenv";

dotenv.config();
    
export const config = {
    kibo: {
        locale: process.env.KIBO_LOCALE || "en-US",
        tenant: Number(process.env.KIBO_TENANT) || 1000118,
        site: Number(process.env.KIBO_SITE) || 1000237,
        masterCatalog: Number(process.env.KIBO_MASTER_CATALOG) || 1,
        catalog: Number(process.env.KIBO_CATALOG) || 1,
        currency: process.env.KIBO_CURRENCY || "USD",
        authHost: process.env.KIBO_AUTH_HOST || "home.mozu.com/api/platform/applications/authtickets/oauth",
        apiHost: process.env.KIBO_API_HOST || "t1000118-s1000237.tp2.usc1.gcp.kibocommerce.com",
        clientId: process.env.KIBO_CLIENT_ID || "FFM.brierly_uat.1.0.8.Release",
        sharedSecret: process.env.KIBO_SHARED_SECRET || "b1d6f7190c23481ca43ed178c3f1c104",
        apiEnv: process.env.KIBO_API_ENV || "sandbox"
    },
    capillary: {
        url: process.env.CAPILLARY_URL || "https://north-america.api.capillarytech.com",
        clientId: process.env.CAPILLARY_CLIENT_ID || "9Og2JxcBeyoLK4RUBbPur8wS2",
        clientSecret: process.env.CAPILLARY_CLIENT_SECRET || "N8pTOaCOMUVuEfLDyaWKQJloi1cRAB6n7GCxlGP9", 
        webhook: process.env.CAPILLARY_WEBHOOK || "https://xcke5nwndk.execute-api.us-east-2.amazonaws.com/uscrm/webhooks/c3c05798ceb35b550bfaf9ac47d8930c",
        webhookSecret: process.env.CAPILLARY_WEBHOOK_SECRET || "ZGVtby5mbGVldGZhcm0uc29sdXRpb24yOjZjOTRiNDc0OTU2NzQ4MjY5NWI0OGI3ZmZmNDcyOTE5"
    },
    scheduler: {
        running: process.env.SCHEDULER_RUNNING === "true",
        return: process.env.SCHEDULER_RETURN === "true"
    }
};

