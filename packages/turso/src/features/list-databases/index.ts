import { withTursoFetch } from "../../helpers/fetch-context";
import { listDatabases as requestListDatabases } from "./list-databases";

export { type Database, ListDatabasesError } from "./list-databases";

export const listDatabases = () => withTursoFetch(() => requestListDatabases());
