"use strict";

import plugin from "../../../lib/plugins/plugin.js";

export class dealMessage extends plugin {
	constructor() {
		super({
			name: "dealMessage",
			event: "message"
		});
		logger.mark(this.priority);
		logger.mark("Msg：",this.e.msg);
	};
};