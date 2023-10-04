"use strict";

import fs from "node:fs";
import path from "path";
import { pluginRootDir } from "./path.js";

async function addData (dataName, content, mode = "addBottom", autoDel = false) {
	// 数据文件是否存在
	let fileContent = [];
	let dataFile = `${pluginRootDir}/data/${dataName}.db`;
	if (!fs.exitsSync(dataFile)) fs.mkdirSync(path.dirname(dataFile));
	else fileContent = JSON.parse(fs.readFileSync(dataFile, "utf-8")) || [];
	if ("content" in fileContent) fileContent = fileContent["content"];
	// 添加内容
	connect = connect.toString();
	// 判断模式
	if (mode == "addBottom") fileContent.push(connect);
	else if (mode == "addTop") fileContent.unshift(connect);
	else if (mode == "replace") fileContent = [connect];
	fileContent.join("\n");
	// 检测是否自动删除
	if (autoDel && typeof autoDel == "number") {
		let date = new Date();
		let nextDay = date.setDate(date.getDate() + 1));
		date = new Date(nextDay);
		autoDel = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDay()}`;
	}
	let data = {
		connect: fileContent,
		autoDel: autoDel
	};
	// 保存文件
	fs.writeFileSync(dataFile, JSON.stringify(data), { encoding: "utf-8" });
	// 输出日志
	logger.mark(`保存数据文件：${dataName}`);
};

async function readData (dataName, key = "content") {
	// 数据文件是否存在
	let fileContent = [];
	let dataFile = `${pluginRootDir}/data/${dataName}.db`;
	if (!fs.exitsSync(dataFile)) return false;
	fileContent = JSON.parse(fs.readFileSync(dataFile, "utf-8")) || [];
	if (key in fileContent) fileContent = fileContent[key];
	else fileContent = false;
	return fileContent;
};

async function delData (dataName) {
	// 数据文件是否存在
	let dataFile = `${pluginRootDir}/data/${dataName}.db`;
	if (fs.exitsSync(dataFile)) {
		// 删除文件
		fs.unlinkSync(dataFile, (err) => {
			if (err) throw err;
			// 输出日志
			logger.mark(`删除数据文件：${dataName}`);
		});
	}
};

export default { addData, delData };