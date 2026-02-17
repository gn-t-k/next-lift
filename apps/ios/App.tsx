import { StatusBar } from "expo-status-bar";
import type { FC } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { HomeScreen } from "./src/components/home-screen";
import { SignInScreen } from "./src/components/sign-in-screen";
import { useSession } from "./src/lib/auth-client";

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

	return (
		<>
			{session ? <HomeScreen /> : <SignInScreen />}
			<StatusBar style="auto" />
		</>
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
