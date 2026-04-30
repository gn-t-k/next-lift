import type { Database } from "@tursodatabase/database";

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
			await db.exec(`ROLLBACK TO SAVEPOINT ${savepoint}`);
			await db.exec(`RELEASE SAVEPOINT ${savepoint}`);
		}
		throw error;
	}
};
