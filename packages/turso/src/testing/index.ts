// テスト用のモックをまとめてre-export

export {
	mockCreateDatabaseDatabaseNotFoundError,
	mockCreateDatabaseError,
	mockCreateDatabaseGetDatabaseError,
	mockCreateDatabaseOk,
} from "../features/create-database/create-database.mock";
export {
	mockDeleteDatabaseError,
	mockDeleteDatabaseOk,
} from "../features/delete-database/delete-database.mock";
export {
	mockIssueTokenError,
	mockIssueTokenOk,
} from "../features/issue-token/issue-token.mock";
export {
	mockListDatabasesError,
	mockListDatabasesOk,
} from "../features/list-databases/list-databases.mock";
