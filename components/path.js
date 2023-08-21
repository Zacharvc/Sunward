"use strict";

import path from "path";

const $path = process.cwd().replace(/\\/g, "/");
// 插件文件夹
const pluginDirName = path.basename(path.join(import.meta.url, "../../"));
// 插件根目录
const pluginRootDir = path.join($path, "plugins", pluginDirName);

export { $path, pluginDirName, pluginRootDir };