// @flow

class Utils{
	static getElementById(elementId: string): HTMLElement {
		const el = document.getElementById(elementId);
		if (!el) {
			throw new Error(`Element ${elementId} doesn't exists`);
		}

		return el;
	}

	static getGenericElementById<T>(elementId: string): T {
		const el = document.getElementById(elementId);
		if (!el) {
			throw new Error(`Element ${elementId} doesn't exists`);
		}

		return el;
	}
}

export default Utils;