import { z } from "zod";

export const credentialsSchema = z.object({
	url: z.string(),
	authToken: z.string(),
	expiresAt: z.string(),
});

export type Credentials = z.infer<typeof credentialsSchema>;
