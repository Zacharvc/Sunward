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
		let reg = new RegExp(/^#*退出群聊*\s*(.*)/, "i");
		let groups = e.msg.match(reg)[1].split(" ");
		// 是否有目标
		if (!groups || groups.length <= 0 || (groups.length == 1 && groups[0] == "")) {
			e.reply("请发送【#退出群聊 + 对应群号或者对应码】", true);
			return;
		}
		// 遍历目标
		let quitNum = 0;
		await groups.forEach( async (group) => {
			let replyMsg = await this.quitTargetGroup(e, group);
			await e.reply(replyMsg, false);
			quitNum++;
		});
		logger.mark(quitNum)
		// 多群提示
		if (quitNum > 1) e.reply("退出群聊命令执行完毕", true);
	};
	
	async quitTargetGroup (event, targetGroup) {
		let e = event;
		// 目标群聊
		let target = targetGroup;
		// 重新载入群聊
		await e.bot.reloadGroupList();
		// 加载群列表
		let groups = Object.keys(e.bot.gl);
		// 是否存在群聊
		if (String(targetGroup).startsWith("G")) {
			// 获取Redis
			let group2code = JSON.parse(await redis.get("Sunward:groups-code"));
			// 查找群聊
			if (!Object.keys(group2code).includes(targetGroup)) return `没有找到对应群聊：${targetGroup}`;
			//
			target = group2code[targetGroup];
		} else {
			if (!groups.includes(Number(target))) return `没有找到相符群聊：${targetGroup}`;
		}
		// 是否为当前群聊
		if (e.isGroup && e?.group_id == target) return "请在私聊或其他群里中使用";
		// 退出群聊
		await e.bot.pickGroup(target).quit();
		return `已退出群聊：${target}`;
	};
	
};