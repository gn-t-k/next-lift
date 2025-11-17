import z from "zod";
import { betterAuthEnvSchemas } from "./better-auth";
import { githubActionsEnvSchemas } from "./github-actions";
import { googleAuthenticationEnvSchemas } from "./google-authentication";
import { nextJsEnvSchemas } from "./next-js";
import { sentryEnvSchemas } from "./sentry";
import { tursoEnvSchemas } from "./turso";

export type PrivateBuildEnv = z.infer<typeof privateBuildEnvSchema>;
export type PrivateRuntimeEnv = z.infer<typeof privateRuntimeEnvSchema>;
export type PublicRuntimeEnv = z.infer<typeof publicRuntimeEnvSchema>;

export const privateBuildEnvSchema = z.object({
	...betterAuthEnvSchemas.privateBuild.shape,
	...githubActionsEnvSchemas.privateBuild.shape,
	...googleAuthenticationEnvSchemas.privateBuild.shape,
	...nextJsEnvSchemas.privateBuild.shape,
	...sentryEnvSchemas.privateBuild.shape,
	...tursoEnvSchemas.privateBuild.shape,
});

export const privateRuntimeEnvSchema = z.object({
	...betterAuthEnvSchemas.privateRuntime.shape,
	...githubActionsEnvSchemas.privateRuntime.shape,
	...googleAuthenticationEnvSchemas.privateRuntime.shape,
	...nextJsEnvSchemas.privateRuntime.shape,
	...sentryEnvSchemas.privateRuntime.shape,
	...tursoEnvSchemas.privateRuntime.shape,
});

export const publicRuntimeEnvSchema = z.object({
	...betterAuthEnvSchemas.publicRuntime.shape,
	...githubActionsEnvSchemas.publicRuntime.shape,
	...googleAuthenticationEnvSchemas.publicRuntime.shape,
	...nextJsEnvSchemas.publicRuntime.shape,
	...sentryEnvSchemas.publicRuntime.shape,
	...tursoEnvSchemas.publicRuntime.shape,
});
