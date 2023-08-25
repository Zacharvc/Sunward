"use strict";

export class quitGroup extends plugin {
	constructor() {
		super({
			name: "quitGroup",
			event: "message",
			dsc: "退出群聊",
			rule: [{
				reg: "#*退出群(聊)*#([\d]+)?",
				fnc: "quitTargetGroup"
			}]
		});
	};
	
	async quitTargetGroup () {
		let e = this.e;
		// 权限判断
		if (!e.isMaster) return;
		// 获取Redis
		let group2code = JSON.parse(await redis.get("Sunward:groups-code"));
		// 是否存在群聊
		let match = e.msg.match(/#*退出群(聊)*#([\d]+)$/)[2] || false;
		if (!match) {
			e.reply("请发送正确的对应码", true);
			return;
		}
		let targetGroup = "#" + match;
		if (!Object.keys(group2code).contains(targetGroup)) {
			e.reply(`没有找到符合条件的群聊：${targetGroup}`, true);
			return;
		}
		// 是否存在一对多
		if (group2code[targetGroup].length > 1) return;
		// 是否为当前群聊
		let target = group2code[targetGroup][0];
		if (e.isGroup && e?.group_id == target) {
			e.reply("请在私聊或其他群里中使用", true);
			return;
		}
		// 退出群聊
		await e.bot.pickGroup(target).quit();
		e.reply(`已退出群聊：${target}`, true);
	};
	
};