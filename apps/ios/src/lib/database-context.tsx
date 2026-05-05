import { exponentialBackoff, withRetry } from "@next-lift/utilities/with-retry";
import {
	createContext,
	type FC,
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import {
	type InitializedDatabase,
	initializeDatabase,
	type PerUserDatabase,
} from "./database";

type DatabaseContextValue = {
	db: PerUserDatabase;
	pull: InitializedDatabase["pull"];
	push: InitializedDatabase["push"];
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
				if (cancelled) return;

				setValue({ db: result.db, pull: result.pull, push: result.push });

				// 初回 pull はバックグラウンドで走らせる。失敗してもローカル読みは可能なため握りつぶす
				result.pull().catch((e: unknown) => {
					console.warn("初回 pull に失敗しました", e);
				});
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

	useEffect(() => {
		if (value == null) return;

		const subscription = AppState.addEventListener("change", (nextState) => {
			if (nextState !== "active") return;
			value.pull().catch((e: unknown) => {
				console.warn("AppState 'active' での pull に失敗しました", e);
			});
		});

		return () => subscription.remove();
	}, [value]);

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
