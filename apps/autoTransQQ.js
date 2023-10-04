"use strict";

import path from "path";
import fs from "node:fs";
import plugin from "../../../lib/plugins/plugin.js";
import config from "../../../lib/config/config.js";
import data from "../components/data.js";
import { $path } from "../components/path.js";
import { exec } from "node:child_process";

export class frozenAutoChange extends plugin {
	constructor() {
		super({
			name: "frozenAutoChange",
			event: "system.offline.frozen",
			priority: -Infinity
		});
	};
	
	// 账号冻结掉线后执行
	async accept () {
		let e = this.e;
		// 是否启用
		let enable = await config.getKey("botQQ", "enable");
		if (!enable) return;
		logger.mark(logger.red(`${Bot.nickname}(${Bot.uin}) 账号被冻结下线`));
		// 是否有可切换的账号
		let canUse = [];
		// 读取数据
		let cannotUse = data.readData("autoTransQQ").split("\n");
		let accounts = await config.getKey("botQQ", "list");
		for (let account in accounts) {
			if (Bot.uin != account && cannotUse.includes(account)) canUse.push(account);
		};
		if (canUse.length <= 0) return;
		// 切换账号
		let delay = await config.getKey("botQQ", "reconnectSec");
		// 替换config/qq.yaml
		let changeTo = canUse[0];
		// 写入数据
		data.addData("autoTransQQ", changeTo, "addBottom", 1);
		let configPath = path.join($path, "config", "qq.yaml");
		// 配置文件是否存在
		if (!fs.exitsSync(configPath)) {
			logger.mark("配置文件不存在，无法切换账号");
			return;
		}
		let yamlQ = fs.readFileSync(configPath, "utf-8").toString();
		yamlQ.replace(/qq:(.*)/g, `qq:${changeTo}`);
		yamlQ.replace(/pwd:(.*)/g, `pwd:${accounts[changeTo]}`);
		// 写入文件
		fs.writeFileSync(configPath, yamlQ, { encoding: "utf-8" });
		// 重新启动
		exec("pnpm run restart", async (error, stdout, stderr) => {
			if (error) return true;
			logger.mark("账号切换成功");
			return true;
		});
	};
	
};

export class kickoffAutoChange extends plugin {
	constructor() {
		super({
			name: "kickoffAutoChange",
			event: "system.offline.kickoff",
			priority: -Infinity
		});
	};
	
	// 账号被顶替下线后执行
	async accept () {
		
	};
	
};