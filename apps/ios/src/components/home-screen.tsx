import { testTable } from "@next-lift/per-user-database/database-schemas";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import {
	type FC,
	useCallback,
	useEffect,
	useState,
	useTransition,
} from "react";
import {
	Alert,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { signOut, useSession } from "../lib/auth-client";
import { clearCredentialsCache } from "../lib/credentials";
import { useDatabase } from "../lib/database-context";
import { deleteAccount } from "../lib/delete-account";

type TestItem = typeof testTable.$inferSelect;

export const HomeScreen: FC = () => {
	const { data: session } = useSession();
	const [isPending, startTransition] = useTransition();
	const [isDeleting, setIsDeleting] = useState(false);
	const { db, sync } = useDatabase();
	const [items, setItems] = useState<TestItem[]>([]);
	const [syncStatus, setSyncStatus] = useState<string>("");

	const loadItems = useCallback(async () => {
		const result = await db.select().from(testTable);
		setItems(result);
	}, [db]);

	useEffect(() => {
		loadItems().catch(console.error);
	}, [loadItems]);

	const handleAddItem = async () => {
		try {
			const id = Crypto.randomUUID();
			await db.insert(testTable).values({
				id,
				name: `テスト ${new Date().toLocaleTimeString("ja-JP")}`,
				createdAt: new Date(),
			});
			await loadItems();
		} catch (e) {
			console.error("追加エラー:", e);
			Alert.alert("エラー", String(e));
		}
	};

	const handleDeleteItem = async (id: string) => {
		try {
			await db.delete(testTable).where(eq(testTable.id, id));
			await loadItems();
		} catch (e) {
			console.error("削除エラー:", e);
		}
	};

	const handleSync = () => {
		try {
			setSyncStatus("同期中...");
			sync();
			setSyncStatus(`同期完了 ${new Date().toLocaleTimeString("ja-JP")}`);
			loadItems().catch(console.error);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			setSyncStatus(`同期エラー: ${message}`);
		}
	};

	const handleSignOut = () => {
		startTransition(async () => {
			try {
				const { error } = await signOut();
				if (error) {
					console.error("Sign out error:", error);
				} else {
					await clearCredentialsCache();
				}
			} catch (e) {
				console.error("Sign out error:", e);
			}
		});
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			"アカウントを削除しますか？",
			"この操作は取り消せません。アカウントに関連するすべての認証情報が削除されます。",
			[
				{ text: "キャンセル", style: "cancel" },
				{
					text: "削除する",
					style: "destructive",
					onPress: async () => {
						setIsDeleting(true);
						try {
							await deleteAccount();
							await clearCredentialsCache();
						} catch {
							Alert.alert("エラー", "アカウントの削除に失敗しました");
						} finally {
							setIsDeleting(false);
						}
					},
				},
			],
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>ようこそ！</Text>
			{session?.user && (
				<View style={styles.userInfo}>
					<Text style={styles.userName}>{session.user.name}</Text>
					<Text style={styles.userEmail}>{session.user.email}</Text>
				</View>
			)}

			{/* Embedded Replicas 動作確認用のリファレンス実装。フェーズ2で本格的なUIに置き換える。 */}
			<View style={styles.testSection}>
				<Text style={styles.sectionTitle}>
					Embedded Replicas テスト ({items.length}件)
				</Text>
				{syncStatus !== "" && (
					<Text style={styles.syncStatus}>{syncStatus}</Text>
				)}
				<View style={styles.buttonRow}>
					<Pressable style={styles.addButton} onPress={handleAddItem}>
						<Text style={styles.addButtonText}>追加</Text>
					</Pressable>
					<Pressable style={styles.syncButton} onPress={handleSync}>
						<Text style={styles.syncButtonText}>Sync</Text>
					</Pressable>
					<Pressable
						style={styles.reloadButton}
						onPress={() => loadItems().catch(console.error)}
					>
						<Text style={styles.reloadButtonText}>再読込</Text>
					</Pressable>
				</View>
				<FlatList
					data={items}
					keyExtractor={(item) => item.id}
					style={styles.list}
					renderItem={({ item }) => (
						<View style={styles.listItem}>
							<View style={styles.listItemContent}>
								<Text style={styles.listItemName}>{item.name}</Text>
								<Text style={styles.listItemId}>{item.id.slice(0, 8)}</Text>
							</View>
							<Pressable onPress={() => handleDeleteItem(item.id)}>
								<Text style={styles.deleteText}>削除</Text>
							</Pressable>
						</View>
					)}
				/>
			</View>

			<Pressable
				style={styles.signOutButton}
				onPress={handleSignOut}
				disabled={isPending || isDeleting}
			>
				<Text style={styles.signOutButtonText}>
					{isPending ? "サインアウト中..." : "サインアウト"}
				</Text>
			</Pressable>
			<Pressable
				style={styles.deleteAccountButton}
				onPress={handleDeleteAccount}
				disabled={isPending || isDeleting}
			>
				<Text style={styles.deleteAccountButtonText}>
					{isDeleting ? "削除中..." : "アカウントを削除"}
				</Text>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#ffffff",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 24,
	},
	userInfo: {
		alignItems: "center",
		marginBottom: 16,
	},
	userName: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		color: "#666666",
	},
	testSection: {
		width: "100%",
		maxWidth: 300,
		marginBottom: 16,
		maxHeight: 300,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	syncStatus: {
		fontSize: 12,
		color: "#666666",
		marginBottom: 8,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 8,
	},
	addButton: {
		flex: 1,
		backgroundColor: "#2563eb",
		paddingVertical: 10,
		borderRadius: 8,
	},
	addButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
	syncButton: {
		flex: 1,
		backgroundColor: "#16a34a",
		paddingVertical: 10,
		borderRadius: 8,
	},
	reloadButton: {
		flex: 1,
		backgroundColor: "#9333ea",
		paddingVertical: 10,
		borderRadius: 8,
	},
	reloadButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
	syncButtonText: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
	list: {
		maxHeight: 200,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	listItemContent: {
		flex: 1,
	},
	listItemName: {
		fontSize: 14,
	},
	listItemId: {
		fontSize: 10,
		color: "#9ca3af",
	},
	deleteText: {
		color: "#dc2626",
		fontSize: 12,
	},
	signOutButton: {
		backgroundColor: "#dc2626",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 8,
		width: "100%",
		maxWidth: 300,
	},
	signOutButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
	deleteAccountButton: {
		borderWidth: 1,
		borderColor: "#dc2626",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 8,
		width: "100%",
		maxWidth: 300,
		marginTop: 12,
	},
	deleteAccountButtonText: {
		color: "#dc2626",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
