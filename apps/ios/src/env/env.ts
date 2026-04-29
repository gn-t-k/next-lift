import { z } from "zod";

const iosEnvSchema = z.object({
	EXPO_PUBLIC_API_URL: z.string(),
	EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string(),
	EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string(),
});

export type IosEnvKey = keyof z.infer<typeof iosEnvSchema>;

// biome-ignore lint/correctness/noProcessGlobal: Expoではprocess.envはMetroがビルド時にインライン展開する
export const env = iosEnvSchema.parse(process.env);
