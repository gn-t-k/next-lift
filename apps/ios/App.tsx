import { StatusBar } from "expo-status-bar";
import type { FC } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { HomeScreen } from "./src/components/home-screen";
import { SignInScreen } from "./src/components/sign-in-screen";
import { useSession } from "./src/lib/auth-client";
import { DatabaseProvider } from "./src/lib/database-context";

const App: FC = () => {
	const { data: session, isPending } = useSession();

	if (isPending) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
				<StatusBar style="auto" />
			</View>
		);
	}

	if (session == null) {
		return (
			<>
				<SignInScreen />
				<StatusBar style="auto" />
			</>
		);
	}

	return (
		<DatabaseProvider>
			<HomeScreen />
			<StatusBar style="auto" />
		</DatabaseProvider>
	);
};

export default App;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#ffffff",
	},
});
