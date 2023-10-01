"use strict";

import plugin from "../../../lib/plugins/plugin.js";

export class withdrawMsg extends plugin {
	constructor() {
		super({
			name: "withdrawMsg",
			event: "message",
			dsc: "撤回消息",
			rule: [{
				reg: "^#*撤回(消息)?$",
				fnc: "withdrawMessage"
			}]
		});
	};
	
	hasPower (e, target) {
		if (!e.isGroup) return null;
		// 获取撤回目标
		let hasPower = false, aimUser = e.group.pickMember(target);
		// 判断权限
		if (e.group.is_owner) hasPower = true;
		else if (!aimUser.is_owner && !aimUser.is_admin && e.group.is_admin) hasPower = true;
		// 返回
		return hasPower;
	};
	
	async withdrawMessage () {
		let e = this.e;
		// 仅群聊
		if (!e.isGroup) return;
		// 是否引用消息
		if (!e.hasReply && !e.source) return;
		// 撤回自己
		if (e.source.user_id === e.self_id) {
			let gapTime = Number(e.time) - Number(e.source.time);
			if (gapTime < 120 || e.group.is_admin || e.group.is_owner) await e.group.recallMsg(e.source.seq);
			else if (gapTime >= 120) this.reply("此消息已超过撤回时间");
		}
		// 撤回他人
		else {
			if (!this.hasPower(e, e.source.user_id)) this.reply("很抱歉，我无权这样做");
			else {
				// 如果是撤回自己
				let me = e.group.pickMember(e.user_id);
				if (e.source.user_id === e.user_id || e.isMaster || me.is_owner || me.is_admin) await e.group.recallMsg(e.source.seq);
				else this.reply("很抱歉，您无权这样做");
			}
		}
	};
	
};