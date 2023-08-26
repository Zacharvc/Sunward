"use strict";

import fs from "node:fs";
import plugin from "../../../lib/plugins/plugin.js";
import config from "../../../lib/config/config.js";
import common from "../components/common.js";

// 机器人管理员
let botManagers = config.masterQQ;

export class gainAnyList extends plugin {
	constructor() {
		super({
			name: "gainAnyList",
			event: "message",
			dsc: "获取机器人账号相关信息列表",
			rule: [{
				reg: "^#*(获取)*好友列表([\d]+)?",
				fnc: "getFriendList"
			}, {
				reg: "^#*(获取)*群(聊)*列表([\d]+)?",
				fnc: "getGroupList"
			}]
		});
	};
	
	getProjectPackage (key) {
		let thisPackage = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
		if (Object.keys(thisPackage).includes(key)) return thisPackage[key];
		return "unknown";
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
				message: `共计 ${friends.size} 位好友`
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
		// Redis
		let tempRedis = {};
		// 遍历好友列表
		friends.forEach( async (value, key) => {
			if (startNum <= seekNum && seekNum <= endNum) {
				let friendUin = key;
				let codeRes = `F${common.codeByte(key, 6)}`;
				// 判断是否需要加密
				if (e.isGroup || !e.isMaster) friendUin = common.codeString(key);
				// 加入转发消息
				let tempMsg = {
					user_id: e.bot.uin,
					nickname: e.bot.nickname,
					message: []
				};
				// 存储数据
				if (!tempRedis[codeRes]) tempRedis[codeRes] = key;
				else {
					codeRes = function () {
						let $codeRes, targetNum = 1;
						Object.keys(tempRedis).forEach( (value, num) => {
							$codeRes = `${codeRes}x${targetNum}`;
							if (value === $codeRes) targetNum++;
						});
						$codeRes = `${codeRes}x${targetNum}`;
						return $codeRes;
					}();
					tempRedis[codeRes] = key;
				}
				// 联系判断
				let relevant = function () {
					if (botManagers.includes(Number(key))) return "管理员";
					return "好友"
				}();
				// 判断是否为自身
				if (Number(key) !== Number(e.bot.uin)) tempMsg.message = [
					`${codeRes}\n`,
					segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${key}`),
					`\n账号|${friendUin}`,
					`\n昵称|${value.nickname}`,
					`\n备注|${value.remark}`,
					`\n联系|${relevant}`
				];
				else tempMsg.message = [
					segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${key}`),
					`\n账号|${key}`,
					`\n昵称|${value.nickname}`,
					`\n项目|${this.getProjectPackage("name")}`,
					`\n版本|${this.getProjectPackage("version")}`,
					`\n作者|${this.getProjectPackage("author")}`
				];
				forwardMsg.push(tempMsg);
			}
			seekNum++;
		});
		// 存储Redis
		await redis.set("Sunward:friends-code", JSON.stringify(tempRedis));
		// 制作转发消息
		if (forwardMsg.length > 1) {
			forwardMsg = await common.generateForwardMsg(e, `共计 ${friends.size} 位好友 (第${targetPage}页/共${Math.ceil(friends.size / pageCount)}页)`, forwardMsg);
			await e.reply(forwardMsg);
		} else e.reply("没有找到符合条件的好友", true);
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
				message: `共计 ${groups.size} 个群聊`
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
		// Redis
		let tempRedis = {};
		// 遍历群列表
		groups.forEach( async (value, key) => {
			if (startNum <= seekNum && seekNum <= endNum) {
				let groupUin = key;
				let codeRes = `G${common.codeByte(key, 6)}`;
				// 判断是否需要加密
				if (e.isGroup || !e.isMaster) groupUin = common.codeString(key);
				// 存储数据
				if (!tempRedis[codeRes]) tempRedis[codeRes] = key;
				else {
					codeRes = function () {
						let $codeRes, targetNum = 1;
						Object.keys(tempRedis).forEach( (value, num) => {
							$codeRes = `${codeRes}x${targetNum}`;
							if (value === $codeRes) targetNum++;
						});
						$codeRes = `${codeRes}x${targetNum}`;
						return $codeRes;
					}();
					tempRedis[codeRes] = key;
				}
				// 添加消息
				forwardMsg.push({
					user_id: e.bot.uin,
					nickname: e.bot.nickname,
					message: [
						`${codeRes}\n`,
						segment.image(`https://p.qlogo.cn/gh/${key}/${key}/100`),
						`\n群号|${groupUin}`,
						`\n群名|${value.group_name}`,
						`\n人数|${value.member_count}/${value.max_member_count}`
					]
				});
			}
			seekNum++;
		});
		// 存储Redis
		await redis.set("Sunward:groups-code", JSON.stringify(tempRedis));
		// 制作转发消息
		if (forwardMsg.length > 1) {
			forwardMsg = await common.generateForwardMsg(e, `共计 ${groups.size} 个群聊 (第${targetPage}页/共${Math.ceil(groups.size / pageCount)}页)`, forwardMsg);
			await e.reply(forwardMsg);
		} else e.reply("没有找到符合条件的群聊", true);
		// 结束
		return true;
	};
	
};