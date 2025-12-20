import type { ComponentProps, FC } from "react";
import { Pressable, StyleSheet } from "react-native";

export const Button: FC<ComponentProps<typeof Pressable>> = (props) => {
	return <Pressable {...props} style={styles.button} />;
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		marginTop: 16,
	},
});
