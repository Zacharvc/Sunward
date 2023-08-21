"use strict";

import fs from "node:fs";
import YAML from "yaml";
import { pluginRootDir } from "./path.js";

// 读取package.yaml
const PackageInfo = await YAML.parse(fs.readFileSync(`${pluginRootDir}/package.yaml`, "utf-8"));

export default PackageInfo;