"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import common from "../components/common.js";

export class gainFriends extends plugin {
	constructor() {
		super({
			name: "gainFriends",
			event: "message",
			rule: [{
				reg: "^#*(获取)*好友列表([\d]+)?",
				fnc: "getFriendList"
			}]
		});
	};
	
	async getFriendList () {
		let e = this.e;
		// 重新载入好友
		await e.bot.reloadFriendList();
		// 获取全部好友
		let friends = await e.bot.fl;
		// 开始, 每页个数
		let seekNum = 0, pageCount = 10;
		// 转发消息
		let forwardMsg = [
			{
				user_id: e.bot.uin,
				nickname: e.bot.nickname,
				message: `※共计 ${e.bot.fl.size} 位好友...`
			}
		];
		// 获取目标页数
		let targetPage = function () {
			let targetPage = 1;
			if (/^#*(获取)*好友列表([\d]+)$/.test(e.msg)) targetPage = Number(e.msg.match(/^#*(获取)*好友列表([\d]+)?$/)[2]);
			if (targetPage > 0) return targetPage;
			return 1;
		}();
		// 计算开始与结尾
		let startNum = (targetPage - 1) * pageCount;
		let endNum = (targetPage * pageCount) - 1;
		// 遍历好友列表
		e.bot.fl.forEach( (key, value) => {
			if (startNum <= seekNum && seekNum <= endNum) {
				let friendUin = value;
				// 判断是否需要加密
				if (e.isGroup || !e.isMaster) friendUin = common.codeString(value);
				// 加入转发消息
				forwardMsg.push({
					user_id: e.bot.uin,
					nickname: e.bot.nickname,
					message: [
						key.remark,
						segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${value}`),
						`\n${friendUin}(${key.nickname})`
					]
				});
			}
			seekNum++;
		});
		// 制作转发消息
		if (forwardMsg.length > 1) {
			forwardMsg = await common.generateForwardMsg(e, `共计 ${e.bot.fl.size} 位好友 (第${targetPage}页/共${Math.ceil(e.bot.fl.size / pageCount)}页)`, forwardMsg);
			await e.reply(forwardMsg);
		}
		return true;
	};
};