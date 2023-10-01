"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import common from "../components/common.js";

export class quitGroup extends plugin {
	constructor() {
		super({
			name: "quitGroup",
			event: "message",
			dsc: "退出群聊",
			rule: [{
				reg: "^#*退出群聊*\s*.*",
				fnc: "quitGroups",
				permission: "master"
			}]
		});
	};
	
	async quitGroups () {
		let e = this.e;
		// 匹配目标
		let reg = new RegExp(/^#*退出群聊*\s*(.*)/, "i");
		// 获取目标群聊
		let groups = e.msg.match(reg)[1].split(" ");
		// 是否有目标
		if (!groups || groups.length <= 0 || (groups.length == 1 && groups[0] == "")) {
			this.reply("请发送【#退出群聊 + 对应群号或者对应码】", true);
			return;
		}
		// 遍历目标
		let forwardMsgList = [];
		for (let group of groups) {
			let forwardMsg = {
				user_id: e.bot.uin,
				nickname: e.bot.nickname,
				message: []
			};
			forwardMsg.message = await this.quitTargetGroup(e, group);
			// 加入消息
			forwardMsgList.push(forwardMsg);
		};
		// 消息提示
		if (forwardMsgList.length > 1) {
			forwardMsgList = await common.generateForwardMsg(e, `命令执行结果`, forwardMsgList);
			await this.reply(forwardMsgList);
		} else await this.reply(forwardMsgList[0].message);
	};
	
	async quitTargetGroup (event, targetGroup) {
		let e = event;
		// 目标群聊
		let target = targetGroup;
		// 重新载入群聊
		await e.bot.reloadGroupList();
		// 加载群列表
		let groups = await e.bot.gl;
		// 获取Redis
		let group2code = JSON.parse(await redis.get("Sunward:groups-code"));
		// 是否存在群聊
		if (String(targetGroup).startsWith("G")) {
			// 查找群聊
			if (!Object.keys(group2code).includes(targetGroup)) return `对应码群聊不存在：${targetGroup}`;
			// 确定目标
			target = group2code[targetGroup];
		} else {
			if (!groups.has(Number(target))) return `指定群聊不存在：${targetGroup}`;
		}
		target = Number(target);
		// 是否为当前群聊
		if (e.isGroup && e?.group_id == target) return `退出本群请私聊或在其他群内使用：${targetGroup}`;
		// 退出群聊
		await e.bot.pickGroup(target).quit();
		// 是否需要加密
		let needCode = false;
		if (e.isGroup) needCode = true;
		target = needCode ? await common.codeString(target) : target;
		return `已退出指定群聊：${target}`;
	};
	
};