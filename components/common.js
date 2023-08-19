"use strict";

// 转发消息制作
async function generateForwardMsg (e, title = false, forwardMsg = []) {
	// 频道则返回
	if (e.QQGuild) return forwardMsg;
	
	if (!Array.isArray(forwardMsg)) forwardMsg = [forwardMsg];
	
	if (e.isGroup) forwardMsg = await e.group.makeForwardMsg(forwardMsg);
	else forwardMsg = await e.friend.makeForwardMsg(forwardMsg);
	
	if (title) {
		if (typeof forwardMsg.data === "object") {
			let detail = forwardMsg.data?.meta?.detail;
			if (detail) detail.news = [{ text: title }];
		} else {
			forwardMsg.data = forwardMsg.data
			.replace(/\n/g, "")
			.replace(/<title color="#777777" size="26">(.+?)<\/title>/g, "___")
			.replace(/(___)+/g, `<title color="#777777" size="26">${title}</title>`);
		}
	}
	
	return forwardMsg;
};

// 字符串中部加密
async function codeString (rawStr, replaceTo = "*") {
	if (!rawStr) return false;
	rawStr = String(rawStr);
	if (rawStr.length <= 2) return replaceTo + replaceTo;
	let startAim = rawStr.length / 3;
	let endAim = startAim * 2;
	let replaceStr = function (length) {
		let tempStr = "";
		for (let i = 0; i < Number(length); i++) tempStr += replaceTo;
		return tempStr;
	}(Math.round(endAim) - Math.round(startAim));
	return rawStr.slice(0, Math.round(startAim)) + replaceStr + rawStr.slice(Math.round(endAim));
};

export default { generateForwardMsg, codeString };