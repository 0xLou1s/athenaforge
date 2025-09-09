import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_PRIVY_APP_ID: z.string(),
  NEXT_PUBLIC_PRIVY_APP_SECRET: z.string(),
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  NEXT_PUBLIC_PRIVY_APP_SECRET: process.env.NEXT_PUBLIC_PRIVY_APP_SECRET,
});

if (!configProject.success) {
  console.error(configProject.error.issues);
  throw new Error("Invalid environment variables");
}

const envConfig = configProject.data;

export default envConfig;
