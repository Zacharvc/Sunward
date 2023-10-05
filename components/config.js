"use strict";

import fs from "node:fs";
import YAML from "yaml";
import { pluginRootDir } from "./path.js";

async function getKey(fileName, key) {
	let filePath = `${pluginRootDir}/config/${fileName}.yaml`, defFilePath = `${pluginRootDir}/config/default/${fileName}.yaml`;
	// 配置文件是否存在
	if (!fs.existsSync(filePath)) {
		if (fs.existsSync(defFilePath)) {
			await fs.copyFileSync(defFilePath, filePath);
			filePath = defFilePath;
		}
	}
	// YAML转Json
	let configs = await YAML.parse(fs.readFileSync(filePath, "utf-8"));
	// 是否存在指定键
	if (key in configs) return configs[key];
	return null;
};

export default { getKey };