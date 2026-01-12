// テスト用のモックをまとめてre-export

export {
	mockCreateDatabaseError,
	mockCreateDatabaseOk,
} from "./create-database/index.mock";
export {
	mockDeleteDatabaseError,
	mockDeleteDatabaseOk,
} from "./delete-database/index.mock";
export {
	mockIssueTokenError,
	mockIssueTokenOk,
} from "./issue-token/index.mock";
