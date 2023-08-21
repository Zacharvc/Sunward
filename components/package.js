"use strict";

import fs from "node:fs";
import YAML from "yaml";
import pluginRootDir from "./path.js";

// 读取package.yaml
const $Package = YAML.parse(fs.readFileSync(`${pluginRootDir}/package.yaml`, "utf-8"));

export { $Package };