"use strict";

export class quitGroup extends plugin {
	constructor() {
		super({
			name: "quitGroup",
			event: "message",
			dsc: "退出群聊",
			rule: [{
				reg: "^#*退出群聊*\s*.*",
				fnc: "quitGroups"
			}]
		});
	};
	
	async quitGroups () {
		let e = this.e;
		// 权限判断
		if (!e.isMaster) return;
		// 匹配目标
		let reg = new RegExp(/^#*退出群聊*\s*(.*)/, "i") || "";
		let groups = msg.match(reg)[1].split(" ");
		// 是否有目标
		if (!group || groups.length <= 0) e.reply("请发送【#退出群聊 + 对应群号或者对应码】", true);
		// 遍历目标
		let quitNum = 0;
		groups.forEach( (group) => {
			let replyMsg = await this.quitTargetGroup(e, group);
			await e.reply(replyMsg, false);
			quitNum++;
		});
		// 多群提示
		if (quitNum > 1) e.reply("退出群聊命令执行完毕", true);
	};
	
	async quitTargetGroup (event, targetGroup) {
		let e = event;
		// 目标群聊
		let target = targetGroup;
		// 重新载入群聊
		await e.bot.reloadGroupList();
		// 是否存在群聊
		if (String(targetGroup).startsWith("G")) {
			// 获取Redis
			let group2code = JSON.parse(await redis.get("Sunward:groups-code"));
			// 查找群聊
			if (!Object.keys(group2code).includes(targetGroup)) return `没有找到符合条件的群聊：${targetGroup}`;
			//
			target = group2code[targetGroup];
		} else {
			if (!e.bot.gl.includes(Number(target))) return `没有找到符合群聊：${targetGroup}`;
		}
		// 是否为当前群聊
		if (e.isGroup && e?.group_id == target) return "请在私聊或其他群里中使用";
		// 退出群聊
		await e.bot.pickGroup(target).quit();
		return `已退出群聊：${target}`;
	};
	
};