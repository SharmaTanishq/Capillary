import 'dotenv/config'
import { Configuration } from '@kibocommerce/rest-sdk'


export const kiboConfiguration = new Configuration({
  tenantId: process.env.KIBO_TENANT,
  siteId: process.env.KIBO_SITE,
  catalog: process.env.KIBO_CATALOG,
  masterCatalog: process.env.KIBO_MASTER_CATALOG,
  sharedSecret: process.env.KIBO_SHARED_SECRET,
  clientId: process.env.KIBO_CLIENT_ID,
  pciHost: '',
  authHost: process.env.KIBO_API_HOST,
  apiEnv: process.env.KIBO_API_ENV,
})

