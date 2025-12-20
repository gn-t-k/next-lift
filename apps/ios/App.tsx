import { open } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { useMigrations } from "drizzle-orm/op-sqlite/migrator";
import { StatusBar } from "expo-status-bar";
import { type FC, useCallback, useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { testTable } from "./db/schema";
import migrations from "./drizzle/migrations";

// op-sqliteでデータベースを開く
const opsqliteDb = open({
	name: "test.db",
});

// Drizzle ORMでラップ
const db = drizzle(opsqliteDb);

type TestItem = typeof testTable.$inferSelect;

const App: FC = () => {
	const { success, error } = useMigrations(db, migrations);
	const [items, setItems] = useState<TestItem[]>([]);
	const [inputText, setInputText] = useState("");

	// データを取得
	const fetchItems = useCallback(async () => {
		const result = await db.select().from(testTable);
		setItems(result);
	}, []);

	// マイグレーション成功後にデータを取得
	useEffect(() => {
		if (success) {
			fetchItems().catch(console.error);
		}
	}, [success, fetchItems]);

	// データを追加
	const handleAdd = useCallback(async () => {
		if (inputText.trim() === "") return;
		await db.insert(testTable).values({ name: inputText.trim() });
		setInputText("");
		await fetchItems();
	}, [inputText, fetchItems]);

	// データを削除
	const handleDelete = useCallback(
		async (id: number) => {
			const { eq } = await import("drizzle-orm");
			await db.delete(testTable).where(eq(testTable.id, id));
			await fetchItems();
		},
		[fetchItems],
	);

	// 全データを削除
	const handleClear = useCallback(async () => {
		await db.delete(testTable);
		await fetchItems();
	}, [fetchItems]);

	// マイグレーションエラー
	if (error) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>Migration error: {error.message}</Text>
				<StatusBar style="auto" />
			</View>
		);
	}

	// マイグレーション中
	if (!success) {
		return (
			<View style={styles.container}>
				<Text>Migration is in progress...</Text>
				<StatusBar style="auto" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Drizzle + op-sqlite Demo</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					value={inputText}
					onChangeText={setInputText}
					placeholder="Enter name"
					onSubmitEditing={handleAdd}
				/>
				<Pressable style={styles.button} onPress={handleAdd}>
					<Text style={styles.buttonText}>Add</Text>
				</Pressable>
			</View>

			<FlatList
				data={items}
				keyExtractor={(item) => item.id.toString()}
				style={styles.list}
				renderItem={({ item }) => (
					<View style={styles.listItem}>
						<View style={styles.listItemContent}>
							<Text style={styles.listItemName}>{item.name}</Text>
							<Text style={styles.listItemDate}>
								{item.createdAt.toLocaleString()}
							</Text>
						</View>
						<Pressable
							style={styles.deleteButton}
							onPress={() => handleDelete(item.id)}
						>
							<Text style={styles.deleteButtonText}>Delete</Text>
						</Pressable>
					</View>
				)}
				ListEmptyComponent={<Text style={styles.emptyText}>No items yet</Text>}
			/>

			<Pressable style={styles.clearButton} onPress={handleClear}>
				<Text style={styles.buttonText}>Clear All</Text>
			</Pressable>

			<StatusBar style="auto" />
		</View>
	);
};
export default App;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingTop: 60,
		paddingHorizontal: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 24,
	},
	inputContainer: {
		flexDirection: "row",
		marginBottom: 16,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
		marginRight: 8,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	list: {
		flex: 1,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
	},
	listItemContent: {
		flex: 1,
	},
	listItemName: {
		fontSize: 16,
		fontWeight: "500",
	},
	listItemDate: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
	},
	deleteButton: {
		backgroundColor: "#FF3B30",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
	},
	deleteButtonText: {
		color: "#fff",
		fontSize: 14,
	},
	clearButton: {
		backgroundColor: "#FF3B30",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 16,
		marginBottom: 32,
	},
	emptyText: {
		textAlign: "center",
		color: "#999",
		fontSize: 16,
		marginTop: 32,
	},
	errorText: {
		color: "#FF3B30",
		fontSize: 16,
		textAlign: "center",
	},
});
