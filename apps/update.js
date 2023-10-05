"use strict";

import { Restart } from "../../other/restart.js";
import plugin from "../../../lib/plugins/plugin.js";
import { pluginRootDir } from "../components/path.js";
import packageInfo from "../components/package.js";
import { exec, execSync } from "node:child_process";

const pluginName = packageInfo.name;
const pluginCnName = packageInfo.cnName;
const pluginVersion = packageInfo.version;

// 计时器
let Timer;

export class updateSunward extends plugin {
	constructor() {
		super({
			name: `${pluginCnName}插件更新`,
			event: "message",
			dsc: "向阳插件更新",
			rule: [{
				reg: `^#*(${pluginName}|${pluginCnName})(插件)*(强制)*更新$`,
				fnc: "updateSunward",
				permission: "master"
			}]
		});
	};
	
	async updateSunward () {
		let e = this.e;
		// 检查Git安装
		if (!await this.checkGit()) return;
		// 是否强制更新
		let isForced = false;
		let command = "git pull";
		if (e.msg.includes("强制")) isForced = true; command = "git checkout . & git pull";
		// 开始提示
		this.reply(`正在执行${(isForced ? "强制" : "")}更新操作，请稍等`);
		// 执行更新命令
		exec(command, { cwd: pluginRootDir }, async (error, stdout, stderr) => {
			// 已经是最新版本
			if (/(已经是最新|Already up[ -]to[ -]date)/.test(stdout)) {
				this.reply(`${pluginCnName}插件目前已是最新版本：${pluginVersion}`);
				return true;
			}
			// 更新出错
			if (error) {
				logger.error(`Error code：${error.code}`);
				logger.error(`Error trick：${error.trick}`);
				this.reply(`${pluginCnName}插件更新出错，请稍后再试！`);
				setTimeout( () => { this.reply("错误信息已输出到日志") }, 500);
				return true;
			}
			// 重启
			Timer && clearTimeout(Timer);
			Timer = setTimeout( () => { new Restart(e).restart() }, 2000);
			// 更新成功提示
			this.reply(`${pluginCnName}插件更新成功，开始尝试调用重启...`);
			
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
	
};