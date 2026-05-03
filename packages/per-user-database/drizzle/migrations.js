// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from "./0000_abnormal_bloodstorm.sql";
import m0001 from "./0001_workable_proudstar.sql";
import m0002 from "./0002_oval_colossus.sql";
import m0003 from "./0003_powerful_aqueduct.sql";
import journal from "./meta/_journal.json";

export default {
	journal,
	migrations: {
		m0000,
		m0001,
		m0002,
		m0003,
	},
};
