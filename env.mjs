import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NEXTAUTH_SECRET: z.string().min(1)
    // ... other server-side environment variables
  }
  // ... client-side environment variables and other configurations
});
