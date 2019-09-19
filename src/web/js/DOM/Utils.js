// @flow

class Utils {
	static getElementById(elementId: string): HTMLElement {
		const el = document.getElementById(elementId);
		if (!el) {
			throw new Error(`Element ${elementId} doesn't exists`);
		}

		return el;
	}

	static getGenericElementById<T: HTMLElement>(elementId: string): T {
		const el = document.getElementById(elementId);
		if (!el) {
			throw new Error(`Element ${elementId} doesn't exists`);
		}

		return ((el: any): T);
	}
}

export default Utils;
