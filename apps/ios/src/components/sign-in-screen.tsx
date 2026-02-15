import { type FC, useState, useTransition } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { signIn } from "../lib/auth-client";
import { getAppleIdToken } from "../lib/get-apple-id-token";
import { getGoogleIdToken } from "../lib/get-google-id-token";

export const SignInScreen: FC = () => {
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = () => {
		setError(null);
		startTransition(async () => {
			try {
				const token = await getGoogleIdToken();
				const result = await signIn.social({
					provider: "google",
					idToken: { token },
				});
				if (result.error) {
					setError("Googleでのサインインに失敗しました");
				}
			} catch {
				setError("Googleでのサインインに失敗しました");
			}
		});
	};

	const handleAppleSignIn = () => {
		setError(null);
		startTransition(async () => {
			try {
				const { token, nonce } = await getAppleIdToken();
				const result = await signIn.social({
					provider: "apple",
					idToken: { token, nonce },
				});
				if (result.error) {
					setError("Appleでのサインインに失敗しました");
				}
			} catch {
				setError("Appleでのサインインに失敗しました");
			}
		});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Next Lift</Text>
			{error && <Text style={styles.error}>{error}</Text>}
			<Pressable
				style={styles.googleButton}
				onPress={handleGoogleSignIn}
				disabled={isPending}
			>
				<Text style={styles.googleButtonText}>
					{isPending ? "サインイン中..." : "Googleでサインイン"}
				</Text>
			</Pressable>
			<Pressable
				style={styles.appleButton}
				onPress={handleAppleSignIn}
				disabled={isPending}
			>
				<Text style={styles.appleButtonText}>
					{isPending ? "サインイン中..." : "Appleでサインイン"}
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
		marginBottom: 40,
	},
	error: {
		color: "#dc2626",
		marginBottom: 16,
		textAlign: "center",
	},
	googleButton: {
		backgroundColor: "#4285f4",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 8,
		marginBottom: 12,
		width: "100%",
		maxWidth: 300,
	},
	googleButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
	appleButton: {
		backgroundColor: "#000000",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 8,
		width: "100%",
		maxWidth: 300,
	},
	appleButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
