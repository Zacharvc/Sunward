"use strict";

import config from "../components/config.js";

export class messageForeDeal extends plugin {
	constructor() {
		super({
			name: "消息处理",
			event: "message",
			priority: -Infinity
		});
		
		this.foreKey = "Sunward:messageForeDeal";
	};

	async accept () {
		let e = this.e;
		// 获取配置
		let memberWhite = await config.getKey("config", "memberWhiteList");
		let memberBlack = await config.getKey("config", "memberBlackList");
		let groupWhite = await config.getKey("config", "groupWhiteList");
		let groupBlack = await config.getKey("config", "groupBlackList");
		// 白名单检测
		if (groupWhite && groupWhite.length > 0 && e.isGroup) {
			if (e.group_id && !groupWhite.includes(e.group_id)) {
				let key = `${this.foreKey}:groupWhite:${e.group_id}`;
				if (!await redis.get(key)) {
					await redis.set(key, true, { EX: 3600 * 12 });
					logger.mark(`[${群聊白名单检测}] 检测到非白名单群聊：${e.group_id}`);
				}
				return;
			}
		}
		if (memberWhite && memberWhite.length > 0) {
			if (e.user_id && !memberWhite.includes(e.user_id)) {
				let key = `${this.foreKey}:memberWhite:${e.user_id}`;
				if (!await redis.get(key)) {
					await redis.set(key, true, { EX: 3600 * 12 });
					logger.mark(`[${成员白名单检测}] 检测到非白名单成员：${e.user_id}`);
				}
				return;
			}
		}
		// 黑名单检测
		if (groupBlack && groupBlack.length > 0 && e.isGroup) {
			if (e.group_id && groupBlack.includes(e.group_id)) {
				let key = `${this.foreKey}:groupBlack:${e.group_id}`;
				if (!await redis.get(key)) {
					await redis.set(key, true, { EX: 3600 * 12 });
					logger.mark(`[${群聊黑名单检测}] 检测到黑名单群聊：${e.group_id}`);
				}
				return;
			}
		}
		if (memberBlack && memberBlack.length > 0) {
			if (e.user_id && memberBlack.includes(e.user_id)) {
				let key = `${this.foreKey}:memberBlack:${e.user_id}`;
				if (!await redis.get(key)) {
					await redis.set(key, true, { EX: 3600 * 12 });
					logger.mark(`[${成员黑名单检测}] 检测到黑名单成员：${e.user_id}`);
				}
				return;
			}
		}
	};

};