import type { Database } from "@tursodatabase/database";

// drizzle 経由ではトランザクション境界も SQL として proxyExecute を通るため、本関数は drizzle 非経由でトランザクションを扱う場面用
export const proxyTransaction = async <T>(
	db: Database,
	callback: () => Promise<T>,
	depth = 0,
): Promise<T> => {
	const savepoint = `sp_${depth}`;

	if (depth === 0) {
		await db.exec("BEGIN");
	} else {
		await db.exec(`SAVEPOINT ${savepoint}`);
	}

	try {
		const result = await callback();
		if (depth === 0) {
			await db.exec("COMMIT");
		} else {
			await db.exec(`RELEASE SAVEPOINT ${savepoint}`);
		}
		return result;
	} catch (error) {
		if (depth === 0) {
			await db.exec("ROLLBACK");
		} else {
			// ROLLBACK TO は SAVEPOINT 自体を残すため、RELEASE で明示的に片付ける必要がある（SQLite 仕様）
			await db.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
			await db.exec(`RELEASE SAVEPOINT ${savepoint}`);
		}
		throw error;
	}
};
