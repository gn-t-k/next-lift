import { type Client, createClient } from "@tursodatabase/serverless/compat";

export type TursoServerlessClientConfig = {
	url: string;
	authToken?: string;
};

export const createTursoServerlessClient = (
	config: TursoServerlessClientConfig,
): Client => {
	return createClient(config);
};
