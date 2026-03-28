import { mockContext } from "@praha/diva/test";
import { mockedPerUserDatabase } from "../testing/mocked-per-user-database";
import { withPerUserDatabase } from "./database-context";

mockContext(withPerUserDatabase, () => mockedPerUserDatabase);
