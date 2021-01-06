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

	static hexToRgbA(hex: string): string {
		let c;
		if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
			c = hex.substring(1).split('');
			if (c.length === 3) {
				c = [c[0], c[0], c[1], c[1], c[2], c[2]];
			}
			c = '0x' + c.join('');
			return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
		}
		return "rgba(0,0,0,1)";
		// throw new Error('Bad Hex');
	}
}

export default Utils;
