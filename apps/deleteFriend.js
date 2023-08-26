"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import common from "../components/common.js";

export class deleteFriend extends plugin {
	constructor() {
		super({
			name: "deleteFriend",
			event: "message",
			dsc: "删除好友",
			rule: [{
				reg: "^#*删除*好友\s*.*",
				fnc: "deleteFriends"
			}]
		});
	};
	
	async deleteFriends () {
		let e = this.e;
		// 权限判断
		if (!e.isMaster) return;
		// 匹配目标
		let reg = new RegExp(/^#*删除*好友\s*(.*)/, "i");
		// 获取目标好友
		let friends = e.msg.match(reg)[1].split(" ");
		// 是否有目标
		if (!friends || friends.length <= 0 || (friends.length == 1 && friends[0] == "")) {
			this.reply("请发送【#删除好友 + 对应账号或者对应码】", true);
			return;
		}
		// 遍历目标
		let forwardMsgList = [];
		for (let friend of friends) {
			let forwardMsg = {
				user_id: e.bot.uin,
				nickname: e.bot.nickname,
				message: []
			};
			forwardMsg.message = await this.delTargetFriend(e, friend);
			// 加入消息
			forwardMsgList.push(forwardMsg);
		};
		// 消息提示
		if (forwardMsgList.length > 1) {
			forwardMsgList = await common.generateForwardMsg(e, `命令执行结果`, forwardMsgList);
			await this.reply(forwardMsgList);
		} else {
			await this.reply(forwardMsgList[0].message);
		}
	};
	
	async delTargetFriend (event, targetFriend) {
		let e = event;
		// 目标好友
		let target = targetFriend;
		// 重新载入好友列表
		await e.bot.reloadFriendList();
		// 加载好友列表
		let friends = await e.bot.fl;
		// 获取Redis
		let friend2code = JSON.parse(await redis.get("Sunward:friends-code"));
		// 是否存在好友
		if (String(targetFriend).startsWith("F")) {
			// 查找好友
			if (!Object.keys(friend2code).includes(targetFriend)) return `对应码好友不存在：${targetFriend}`;
			// 确定目标
			target = friend2code[targetFriend];
		} else {
			if (!friends.has(Number(target))) return `指定好友不存在：${targetFriend}`;
		}
		target = Number(target);
		// 删除好友
		await e.bot.pickFriend(target).delete();
		return `已删除指定好友：${target}`;
	};
	
};