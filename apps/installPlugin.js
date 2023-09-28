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
		let reg = new RegExp(/^#*(安装插件|>>>) (.*) (.*)/, "i");
		let url = e.msg.match(reg)[2], pluginName = e.msg.match(reg)[3];
		// 检测合法性
		if (!url || url == "") {
			this.reply("请输入插件项目地址");
			return;
		}
		if (!pluginName || pluginName == "") {
			this.reply("请输入插件安装目录");
			return;
		}
		let command = `git clone ${url}.git ./plugins/${pluginName}`;
		// 提示
		this.reply("开始安装插件：" + pluginName);
		// 执行操作
		exec(command, { cwd: $path }, async (error, stdout, stderr) => {
			// 安装出错
			if (error) {
				logger.error(`Error code：${error.code}`);
				if (/(does not exist)/.test(stderr)) this.reply("错误：项目地址不存在！");
				else if(/(already exists and is not an empty directory)/.test(stderr)) this.reply("错误：插件已存在！");
				else this.reply(stderr);
				setTimeout( () => { this.reply(`${pluginName} 安装出错，请稍后再试！`) }, 500);
				return true;
			}
			// 安装成功
			this.reply(`${pluginName} 项目克隆成功，请自行重启以应用插件`);
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