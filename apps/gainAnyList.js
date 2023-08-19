"use strict";

import plugin from "../../../lib/plugins/plugin.js";
import common from "../components/common.js";

export class gainAnyList extends plugin {
	constructor() {
		super({
			name: "gainAnyList",
			event: "message",
			rule: [{
				reg: "^#*(获取)*好友列表([\d]+)?",
				fnc: "getFriendList"
			}, {
				reg: "^#*(获取)*群(聊)*列表([\d]+)?",
				fnc: "getGroupList"
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
				message: `※共计 ${friends.size} 位好友`
			}
		];
		// 获取目标页数
		let targetPage = function () {
			let reg = "^#*(获取)*好友列表([\d]+)";
			let targetPage = 1;
			if (eval(`/${reg}$/`).test(e.msg)) targetPage = Number(e.msg.match(eval(`/${reg}?$/`))[2]);
			if (targetPage > 0) return targetPage;
			return 1;
		}();
		// 计算开始与结尾
		let startNum = (targetPage - 1) * pageCount;
		let endNum = (targetPage * pageCount) - 1;
		// 遍历好友列表
		await friends.forEach( async (key, value) => {
			if (startNum <= seekNum && seekNum <= endNum) {
				let friendUin = value;
				// 判断是否需要加密
				if (e.isGroup || !e.isMaster) friendUin = await common.codeString(value);
				// 加入转发消息
				if (Number(value) !== Number(e.bot.uin)) forwardMsg.push({
					user_id: e.bot.uin,
					nickname: e.bot.nickname,
					message: [
						segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${value}`),
						`\n账号：${friendUin}`,
						`\n昵称：${key.nickname}`,
						`\n备注：${key.remark}`
					]
				});
			}
			seekNum++;
		});
		// 制作转发消息
		if (forwardMsg.length > 1) {
			forwardMsg = await common.generateForwardMsg(e, `共计 ${friends.size} 位好友 (第${targetPage}页/共${Math.ceil(friends.size / pageCount)}页)`, forwardMsg);
			await e.reply(forwardMsg);
		} else e.reply("※没有找到符合条件的好友", true);
		// 结束
		return true;
	};
	
	async getGroupList () {
		let e = this.e;
		// 重新载入群聊
		await e.bot.reloadGroupList();
		// 获取全部群聊
		let groups = await e.bot.gl;
		// 开始, 每页个数
		let seekNum = 0, pageCount = 10;
		// 转发消息
		let forwardMsg = [
			{
				user_id: e.bot.uin,
				nickname: e.bot.nickname,
				message: `※共计 ${groups.size} 个群聊`
			}
		];
		// 获取目标页数
		let targetPage = function () {
			let reg = "^#*(获取)*群(聊)*列表([\d]+)";
			let targetPage = 1;
			if (eval(`/${reg}$/`).test(e.msg)) targetPage = Number(e.msg.match(eval(`/${reg}?$/`))[2]);
			if (targetPage > 0) return targetPage;
			return 1;
		}();
		// 计算开始与结尾
		let startNum = (targetPage - 1) * pageCount;
		let endNum = (targetPage * pageCount) - 1;
		// 遍历群列表
		await groups.forEach( async (key, value) => {
			if (startNum <= seekNum && seekNum <= endNum) {
				let groupUin = value;
				// 判断是否需要加密
				if (e.isGroup || !e.isMaster) groupUin = await common.codeString(value);
				// 加入转发消息
				forwardMsg.push({
					user_id: e.bot.uin,
					nickname: e.bot.nickname,
					message: [
						segment.image(`https://p.qlogo.cn/gh/${value}/${value}/100`),
						`\n群号：${groupUin}`,
						`\n名称：${key.group_name}`,
						`\n人数：${key.member_count}/${key.max_member_count}`
					]
				});
			}
			seekNum++;
		});
		// 制作转发消息
		if (forwardMsg.length > 1) {
			forwardMsg = await common.generateForwardMsg(e, `共计 ${groups.size} 个群聊 (第${targetPage}页/共${Math.ceil(groups.size / pageCount)}页)`, forwardMsg);
			await e.reply(forwardMsg);
		} else e.reply("※没有找到符合条件的群聊", true);
		// 结束
		return true;
	};
};