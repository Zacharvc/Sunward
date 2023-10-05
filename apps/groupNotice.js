"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import config from "../components/config.js";
import common from "../components/common.js";

const Reg = new RegExp(/#\([^\(\)]+\)/, "g");
const enableMemberIncrease = await config.getKey("config", "enableMemberIncrease");
const enableMemberDecrease = await config.getKey("config", "enableMemberDecrease");

export class memberIncrease extends plugin {
	constructor() {
		super({
			name: "memberIncrease",
			event: "notice.group.increase",
			priority: -Infinity
		});
	};

	async accept () {
		if (!enableMemberIncrease) return;
		// 发送消息
		let tips = await config.getKey("config", "increaseTips");
		if (!tips.match(Reg)) return;
		tips.match(Reg).forEach( (replace) => {
			let replaceTo = replace.split("#(")[1];
			replaceTo = replaceTo.slice(0, replaceTo.lastIndexOf(")"));
			replaceTo = eval(replaceTo);
			tips = tips.replace(replace, replaceTo);
		});
		await this.reply(tips);
		// Return
		return true;
	};

};

export class memberDecrease extends plugin {
	constructor() {
		super({
			name: "memberDecrease",
			event: "notice.group.decrease",
			priority: -Infinity
		});
	};

	async accept () {
		if (!enableMemberDecrease) return;
		// 发送消息
		let tips = await config.getKey("config", "decreaseTips");
		if (!tips.match(Reg)) return;
		tips.match(Reg).forEach( (replace) => {
			let replaceTo = replace.split("#(")[1];
			replaceTo = replaceTo.slice(0, replaceTo.lastIndexOf(")"));
			replaceTo = eval(replaceTo);
			tips = tips.replace(replace, replaceTo);
		});
		await this.reply(tips);
		// Return
		return true;
	};

};