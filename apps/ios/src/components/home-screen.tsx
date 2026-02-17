import { type FC, useState, useTransition } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { signOut, useSession } from "../lib/auth-client";
import { deleteAccount } from "../lib/delete-account";

export const HomeScreen: FC = () => {
	const { data: session } = useSession();
	const [isPending, startTransition] = useTransition();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleSignOut = () => {
		startTransition(async () => {
			try {
				const { error } = await signOut();
				if (error) {
					console.error("Sign out error:", error);
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
		marginBottom: 32,
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
