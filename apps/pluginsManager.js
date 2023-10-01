"use strict";

import fs from "node:fs";
import path from "path";
import plugin from "../../../lib/plugins/plugin.js";
import { Restart } from "../../other/restart.js";
import { exec, execSync } from "node:child_process";

let isInstalling = false, isRemoving = false;
const $path = process.cwd().replace(/\\/g, "/");

export class pluginsManager extends plugin {
	constructor() {
		super({
			name: "pluginsManager",
			event: "message",
			dsc: "插件管理",
			rule: [{
				reg: "^#*>?(安装插件|>>>)\s*.*",
				fnc: "installTargetPlugin"
			}, {
				reg: "^#*<?(移除插件|<<<)\s*.*",
				fnc: "removeTargetPlugin"
			}]
		});
	};
	
	async installTargetPlugin () {
		let e = this.e;
		// 检查Git安装
		if (!await this.checkGit()) return;
		// 权限判断
		if (!e.isMaster) return;
		// 是否仍在运行
		if (isInstalling) {
			this.reply("其他项目安装中，请稍等");
			return;
		}
		// 获取目标插件
		let reg = new RegExp(/^#*(>)?(安装插件|>>>)\s*(.*)/, "i");
		let msg = e.msg.match(reg)[3].split(" ");
		let url = msg[0], pluginName = (msg.length > 1) ? msg[1] : "";
		let autoRestart = e.msg.match(reg)[1] ? true : false;
		// 检测合法性
		if (!url || url === "") {
			this.reply("请输入插件项目地址");
			return;
		}
		// 使用默认路径
		let _url = url.split("/");
		if (!pluginName || pluginName === "") pluginName = _url[_url.length - 1];
		if (pluginName.endsWith(".git")) pluginName = pluginName.split(".git")[0];
		let command = `git clone ${url}${(url.endsWith(".git") ? "" : ".git")} ./plugins/${pluginName}`;
		// 提示
		isInstalling = true;
		await this.reply("开始安装插件 " + pluginName);
		// 执行操作
		exec(command, { cwd: $path, windowsHide: true }, async (error, stdout, stderr) => {
			isInstalling = false;
			// 安装出错
			if (error) {
				logger.error(`Error code：${error.code}`);
				if (/(does not exist)/.test(stderr)) this.reply("错误：项目地址不存在！");
				else if(/(already exists and is not an empty directory)/.test(stderr)) this.reply("错误：文件夹已存在！");
				else this.reply(stderr);
				setTimeout( () => { this.reply(`${pluginName} 安装出错，请稍后再试！`) }, 500);
				return true;
			}
			// 克隆成功
			// 是否自动重启
			if (autoRestart) {
				await this.reply(`${pluginName} 项目克隆成功，开始尝试调用重启...`);
				setTimeout( () => { new Restart(e).restart() }, 2000);
			} else this.reply(`${pluginName} 项目克隆成功，请自行重启以应用插件`);
			// 判断是否为插件
			let isPlugin = fs.existsSync(path.join($path, "plugins", pluginName, "index.js"));
			if (!isPlugin) this.reply(`${pluginName} 缺少主要文件，这可能不是一个插件，请注意`);
			return true;
		});
	};
	
	async removeTargetPlugin () {
		let e = this.e;
		// 权限判断
		if (!e.isMaster) return;
		// 是否仍在运行
		if (isRemoving) {
			this.reply("其他插件移除中，请稍等");
			return;
		}
		// 获取目标插件
		let reg = new RegExp(/^#*(<)?(移除插件|<<<)\s*(.*)/, "i");
		let pluginName = e.msg.match(reg)[3];
		let autoRestart = e.msg.match(reg)[1] ? true : false;
		// 检测合法性
		if (!pluginName || pluginName === "") {
			this.reply("请输入需要移除的插件");
			return;
		}
		// 插件是否存在
		if (!fs.existsSync(path.join($path, "plugins", pluginName, ".git"))) {
			this.reply(pluginName + " 插件不存在！");
			return;
		}
		// 执行操作
		isRemoving = true;
		let command = `rm -rf ${pluginName}`;
		exec(command, { cwd: path.join($path, "plugins"), windowsHide: true }, async (error, stdout, stderr) => {
			isRemoving = false;
			// 移除出错
			if (error) {
				logger.error(`Error code：${error.code}`);
				logger.error(`Error trick：${error.trick}`);
				this.reply(`${pluginName} 移除出错，请查看日志`);
				return true;
			}
			// 移除成功
			// 是否自动重启
			if (autoRestart) {
				await this.reply(`${pluginName} 移除成功，开始尝试调用重启...`);
				setTimeout( () => { new Restart(e).restart() }, 2000);
			} else this.reply(`${pluginName} 移除成功，请手动重启防止插件报错`);
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