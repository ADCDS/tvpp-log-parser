// @flow

import Filter from "./Graph/Filter/Filter";

class UserOption<T> {
	name: string;
	type: Class<T>;
	default: any;

	constructor(name: string, type: Class<T>, defaultValue: any) {
		this.name = name;
		this.type = type;
		this.default = defaultValue;
	}

	isFilter(): boolean {
		// eslint-disable-next-line flowtype-errors/show-errors
		return this.type !== String && this.type !== Number && this.type !== Boolean && (this.type.prototype instanceof Filter || this.type === Filter);
	}

	isNumber(): boolean {
		return this.type === Number;
	}

	isString(): boolean {
		return this.type === String;
	}

	isBoolean(): boolean {
		return this.type === Boolean;
	}
}

export default UserOption;
