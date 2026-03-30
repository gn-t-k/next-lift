import { mockPrivateEnv } from "@next-lift/env/testing";
import { mockContext } from "@praha/diva/test";
import { mockedPerUserDatabase } from "../testing/mocked-per-user-database";
import { withPerUserDatabase } from "./database-context";

mockPrivateEnv({
	APP_ENV: "development-test",
});

mockContext(withPerUserDatabase, () => mockedPerUserDatabase);
