"use strict";

import plugin from "../../../lib/plugins/plugin.js";

export class dealMessage extends plugin {
	constructor() {
		super({
			name: "dealMessage",
			event: "message"
		});
	};
	
	async accept () {
		logger.mark(this.e);
	};
	
};