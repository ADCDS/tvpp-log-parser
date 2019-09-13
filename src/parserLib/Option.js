//@flow

import Filter from "./Graph/Filter/Filter";

class Option {
	name: string;
	type: Class<string> | Class<number> | Class<boolean> | Class<Filter>;
	default: any;

	constructor(name: string, type: Class<string> | Class<number> | Class<boolean> | Class<Filter>, defaultValue: any) {
		this.name = name;
		this.type = type;
		this.default = defaultValue;
	}
}

export default Option;
