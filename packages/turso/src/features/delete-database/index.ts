import { withTursoFetch } from "../../helpers/fetch-context";
import { deleteDatabase as requestDeleteDatabase } from "./delete-database";

export { DatabaseNotFoundError, DeleteDatabaseError } from "./delete-database";

export const deleteDatabase = (databaseName: string) =>
	withTursoFetch(() => requestDeleteDatabase(databaseName));
