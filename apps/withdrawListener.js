"use strict";

import plugin from "../../../lib/plugins/plugin.js";

export class withdrawListener extends plugin {
	constructor() {
		super({
			name: "withdrawListener",
			event: "notice.group.recall",
			dsc: "群消息撤回捕获"
		});
	};
	
	async accept () {
		logger.mark(this);
	};
	
};