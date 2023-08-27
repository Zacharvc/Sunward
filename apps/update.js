"use strict";

import { createRequire } from "module";
import plugin from "../../../lib/plugins/plugin.js";
import { pluginRootDir } from "../components/path.js";
import packageInfo from "../components/package.js";
import { exec, execSync } from "node:child_process";

const require = createRequire(import.meta.url);

const pluginName = packageInfo.name;
const pluginCnName = packageInfo.cnName;

export class updateSunward extends plugin {
	constructor() {
		super({
			name: "updateSunward",
			event: "message",
			dsc: "向阳插件更新",
			rule: [{
				reg: `^#*(${pluginName}|${pluginCnName})(插件)*(强制)*更新`,
				fnc: "updateSunward",
				permission: "master"
			}]
		});
	};
	
	async updateSunward () {
		let e = this.e;
		// 检查Git安装
		if (await this.checkGit()) return;
		// 是否强制更新
		let command = "git pull";
		if (e.msg.includes("强制")) command = "git checkout . & git pull";
		// 执行更新命令
		exec(command, { cwd: pluginRootDir }, async (error, stdout, stderr) => {
			// 已经是最新版本
			if (/(已经是最新|Already up[ -]to[ -]date)/.test(stdout)) {
				this.reply(`${pluginCnName}插件已是最新版本`);
				return true;
			}
			// 更新出错
			if (error) {
				logger.error(`Error code：${error.code}`);
				logger.error(`Error trick：${error.trick}`);
				await this.reply(`${pluginCnName}插件更新出错，请稍后再试！`);
				this.reply("错误信息已输出到日志");
			}
			// 重启
			this.reply(`${pluginCnName}插件更新成功，尝试调动重启...`);
			// 重启失败提示
			if (!await this.restart(e)) this.reply("重启失败，请手动重启！");
			
			return true;
		});
	};
	
	async checkGit () {
		let ret = await execSync("git --version", { encoding: "utf-8" });
		if (!ret || !ret.includes("git version")) {
			await this.reply("请先安装Git");
			return false;
		}
		return true;
	};
	
	async restart (e) {
		const { Restart } = require("../../other/.restart.js");
		return await new Restart(e).restart();
	};
	
};