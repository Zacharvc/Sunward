"use strict";

// 导入包
import fs from "node:fs";
import YAML from "yaml";

// 插件目录名称
const plugin = "Sunward";

// 获取插件目录文件
const appFiles = fs.readdirSync(`./plugins/${plugin}/apps`).filter( (file) => file.endsWith(".js") );
// 读取package.yaml
const $Package = YAML.parse(fs.readFileSync(`./plugins/${plugin}/package.yaml`, "utf-8"));
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
	`您的使用就是对我莫大的鼓励！`
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
				logger.error(logger.red(`载入组件时出错:${appFiles[num]}`));
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