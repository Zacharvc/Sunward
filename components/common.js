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
function codeString (rawStr, replaceTo = "*") {
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

// 伪哈希
function codeByte (rawStr, length) {
	// 是否可使用
	if (typeof rawStr == "undefined" || rawStr.length <= 0) return false;
	if (!length || typeof length !== "number") length = 6;
	
	rawStr = "";
	let $rawStr = String(rawStr).split("");
	while (rawStr.length < length) $rawStr.forEach( (x) => { rawStr += x.codePointAt(0), $rawStr = rawStr.split("") });
	rawStr = rawStr.slice(Math.floor(rawStr.length / 2));
	
	function replaceInt (number) {
		number = String(number);
		number = number
			.replace(/\./g, "7")
			.replace(/e/g, "7")
			.replace(/\+/g, "7")
		return number;
	};
	
	rawStr = replaceInt(Number(rawStr) / 7777777 * (length + 1));
	
	if (rawStr.length >= length) rawStr = rawStr.slice(-length);
	else { while (rawStr.length < length) rawStr = String(Number(rawStr) * length).slice(-length) }
	
	return replaceInt(rawStr);
};

export default { generateForwardMsg, codeString, codeByte };