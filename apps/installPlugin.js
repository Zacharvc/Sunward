"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import common from "../components/common.js";
import { exec, execSync } from "node:child_process";

const $path = process.cwd().replace(/\\/g, "/");

export class installPlugin extends plugin {
	constructor() {
		super({
			name: "installPlugin",
			event: "message",
			dsc: "安装插件",
			rule: [{
				reg: "^#*(安装插件|>>>) (.*) (.*)",
				fnc: "installTargetPlugin"
			}]
		});
	};
	
	async installTargetPlugin () {
		let e = this.e;
		// 检查Git安装
		if (!await this.checkGit()) return;
		// 权限判断
		if (!e.isMaster) return;
		// 获取命令
		let reg = new RegExp(/^#*(安装插件|>>>) (.*) (.*)/, "g");
		let url = e.msg.match(reg)[2], pluginName = e.msg.match(reg)[3];
		// 检测合法性
		if (!url || !pluginName) {
			this.reply("数据不完整，请重新输入！");
			return;
		}
		let command = `git clone ${url}.git ./plugins/${pluginName}/`;
		// 提示
		this.reply("开始安装插件：" + pluginName);
		// 执行操作
		exec(command, { cwd: $path }, async (error, stdout, stderr) => {
			// 插件已存在
			if (/(already exists and is not an empty directory)/.test(stdout)) {
				this.reply(`${pluginName} 已存在，安装已停止`);
				return true;
			}
			// 安装出错
			if (/(does not exist)/.test(stdout)) {
				this.reply("项目地址不存在，请重新输入！");
				return true;
			}
			if (error) {
				logger.error(`Error code：${error.code}`);
				logger.error(`Error trick：${error.trick}`);
				this.reply(`${pluginName} 安装出错，请稍后再试！`);
				setTimeout( () => { this.reply("错误信息已输出到日志") }, 500);
				return true;
			}
			// 安装成功
			this.reply(`${pluginName} 安装成功！`);
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