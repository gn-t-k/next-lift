import { exponentialBackoff, withRetry } from "@next-lift/utilities/with-retry";
import {
	createContext,
	type FC,
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
	type InitializedDatabase,
	initializeDatabase,
	type PerUserDatabase,
} from "./database";

type DatabaseContextValue = {
	db: PerUserDatabase;
	sync: InitializedDatabase["sync"];
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export const DatabaseProvider: FC<PropsWithChildren> = ({ children }) => {
	const [value, setValue] = useState<DatabaseContextValue | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		withRetry(() => initializeDatabase(), {
			backoff: exponentialBackoff(1000),
		})
			.then((result) => {
				if (!cancelled) {
					setValue({ db: result.db, sync: result.sync });
				}
			})
			.catch((e: unknown) => {
				if (!cancelled) {
					setError(e instanceof Error ? e : new Error(String(e)));
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (error != null) {
		throw error;
	}

	if (value == null) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <DatabaseContext value={value}>{children}</DatabaseContext>;
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#ffffff",
	},
});

export const useDatabase = (): DatabaseContextValue => {
	const context = useContext(DatabaseContext);

	if (context == null) {
		throw new Error("useDatabase は DatabaseProvider 内で使用してください");
	}

	return context;
};
