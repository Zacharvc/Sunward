"use strict";

// 导入包
import fs from "node:fs";

// 插件名称
const plugin = "Sunward";

// 载入欢迎语
const welcomeTips = "感谢使用向阳插件，您的支持是我更新的动力！";

// 获取插件目录文件
const appFiles = fs.readdirSync(`./plugins/${plugin}/apps`).filter( (file) => file.endsWith(".js") );

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
	logger.info("---------------------");
	logger.info(welcomeTips);
	// 返回apps
	return apps;
};

// 获取apps
let apps = await allInitial(Bot);

export { apps };