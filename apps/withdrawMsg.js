"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import config from "../components/config.js";

export class withdrawMsg extends plugin {
	constructor() {
		super({
			name: "withdrawMsg",
			event: "message",
			dsc: "撤回消息",
			rule: [{
				reg: "^#*撤回(消息)?$",
				fnc: "withdrawMessage"
			}, {
				reg: "^#*(公投|票选|投票)撤回(消息)?$",
				fnc: "voteToWithdrawMsg"
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
				else this.reply("很抱歉，您无权这样做，或者您可以使用指令：#投票撤回");
			}
		}
	};
	
	async voteToWithdrawMsg () {
		let e = this.e;
		// 仅群聊
		if (!e.isGroup) return;
		// 是否引用消息
		if (!e.hasReply && !e.source) return;
		// 撤回自己
		if (e.source.user_id === e.self_id) await this.withdrawMessage();
		// 有无权限
		else if (!this.hasPower(e, e.source.user_id)) this.reply("发起失败，我无权撤回目标消息");
		else {
			let needNum = (await config.getKey("config", "atLeastNum")) || 2;
			let keepTime = (await config.getKey("config", "expireDuration")) || 180;
			// 获取Redis
			let voteNum = await redis.get(`Sunward:voteToWithdrawMsg:${e.group_id}:${e.source.seq}`);
			// 是否首次投票
			if (!voteNum) voteNum = 0;
			// 判断人数是否超过指定
			if (voteNum >= needNum) {
				await e.group.recallMsg(e.source.seq);
				await redis.del(`Sunward:voteToWithdrawMsg:${e.group_id}:${e.source.seq}`);
				this.reply("投票撤回成功，已撤回目标消息");
			} else {
				voteNum++;
				if (voteNum === 1) await this.reply(`${e.member.card} 发起了撤回投票(1/${needNum}), 三分钟后失效`);
				else if (voteNum > 1) await this.reply(`${e.member.card} 同意了撤回投票(${voteNum}/${needNum})`);
				// 存储Redis
				await redis.set(`Sunward:voteToWithdrawMsg:${e.group_id}:${e.source.seq}`, voteNum, { EX: keepTime });
			}
		}
	};
	
};