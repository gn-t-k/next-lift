import { type FC, useTransition } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { signOut, useSession } from "../lib/auth-client";

export const HomeScreen: FC = () => {
	const { data: session } = useSession();
	const [isPending, startTransition] = useTransition();

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
				disabled={isPending}
			>
				<Text style={styles.signOutButtonText}>
					{isPending ? "サインアウト中..." : "サインアウト"}
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
});
