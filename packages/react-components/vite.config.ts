import { react as reactConfig } from "@configs/react/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mergeConfig } from "vite";

export default mergeConfig(reactConfig, {
	plugins: [react(), tailwindcss()],
});
