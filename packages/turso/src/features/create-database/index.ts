import { withTursoFetch } from "../../helpers/fetch-context";
import { createDatabase as requestCreateDatabase } from "./create-database";

export {
	CreateDatabaseError,
	DatabaseNotFoundError,
	GetDatabaseError,
} from "./create-database";

export const createDatabase = (databaseName: string) =>
	withTursoFetch(() => requestCreateDatabase(databaseName));
