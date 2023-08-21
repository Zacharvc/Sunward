"use strict";

// 导入包
import fs from "node:fs";
import $Package from "./components/package.js";
import { pluginRootDir } from "./components/path.js";

// 获取插件目录文件
const appFiles = fs.readdirSync(`${pluginRootDir}/apps`).filter( (file) => file.endsWith(".js") );
// 插件名称
const pluginName = $Package.name;
const pluginNameCn = $Package.cNname;
// 插件版本
const pluginVersion = $Package.version;
// 插件作者
const pluginAuthor = $Package.author;

// 插件初始化欢迎语
let welcomeTips = [
	`------------------------`,
	`欢迎使用${pluginNameCn}(${pluginName})插件`,
	`当前版本：${pluginVersion}`,
	`您的支持是我更新的动力！`
];

async function allInitial (Client) {
	// 没有机器人全局变量则跳出
	if (!Client) return;
	// 初始化插件
	let ret = await function () {
		let ret = [];
		appFiles.forEach( (file) => { ret.push(import (`./apps/${file}`)) });
		ret = Promise.allSettled(ret);
		return ret;
	}();
	// 载入插件
	let apps = await function () {
		let apps = {};
		for (let num in appFiles) {
			if (ret[num].status !== "fulfilled") {
				logger.error(`载入组件时出错:${logger.red(appFiles[num])}`);
				logger.error(logger.red("------------------------"));
				logger.error(ret[num].reason);
				logger.error(logger.red("------------------------"));
				continue;
			}
			Object.keys(ret[num].value).forEach( (app) => {
				apps[app] = ret[num].value[app];
			});
		}
		return apps;
	}();
	// 输出欢迎语
	welcomeTips.forEach( (tip) => { logger.info(tip) });
	// 输出apps
	return apps;
};

// 获取apps
let apps = await allInitial(Bot);

export { apps };