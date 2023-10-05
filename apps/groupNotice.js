"use strict";

import { segment } from "oicq";
import plugin from "../../../lib/plugins/plugin.js";
import config from "../components/config.js";
import common from "../components/common.js";

const Reg = new RegExp(/#\([^\(\)]+\)/, "g");
const enableMemberIncrease = await config.getKey("config", "enableMemberIncrease");
const enableMemberDecrease = await config.getKey("config", "enableMemberDecrease");

export class memberIncrease extends plugin {
	constructor() {
		super({
			name: "入群通知",
			event: "notice.group.increase",
			priority: -Infinity
		});
	};

	async accept () {
		if (!enableMemberIncrease) return;
		// 发送消息
		let tips = await config.getKey("config", "increaseTips");
		let topAt = await config.getKey("config", "topAtIncrease");
		if (!tips.match(Reg)) return;
		// 替换处理
		tips.match(Reg).forEach( (replace) => {
			let replaceTo = replace.split("#(")[1];
			replaceTo = replaceTo.slice(0, replaceTo.lastIndexOf(")"));
			replaceTo = eval(replaceTo) || this.e.user_id;
			tips = tips.replace(replace, replaceTo);
		});
		// 构建消息
		let msg = [tips];
		if (topAt) msg.unshift(segment.at(this.e.user_id));
		logger.mark(`[${this.name}] ${this.e.user_id} 加入 ${this.e.group_id}`);
		await this.reply(msg);
		// Return
		return true;
	};

};

export class memberDecrease extends plugin {
	constructor() {
		super({
			name: "退群通知",
			event: "notice.group.decrease",
			priority: -Infinity
		});
	};

	async accept () {
		if (!enableMemberDecrease) return;
		// 发送消息
		let tips = await config.getKey("config", "decreaseTips");
		let topAt = await config.getKey("config", "topAtDecrease");
		if (!tips.match(Reg)) return;
		// 替换处理
		tips.match(Reg).forEach( (replace) => {
			let replaceTo = replace.split("#(")[1];
			replaceTo = replaceTo.slice(0, replaceTo.lastIndexOf(")"));
			replaceTo = eval(replaceTo) || this.e.user_id;
			tips = tips.replace(replace, replaceTo);
		});
		// 构建消息
		let msg = [tips];
		if (topAt) msg.unshift(segment.at(this.e.user_id));
		logger.mark(`[${this.name}] ${this.e.user_id} 退出 ${this.e.group_id}`);
		await this.reply(msg);
		// Return
		return true;
	};

};