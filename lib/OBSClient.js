import OBSWebSocket from 'obs-websocket-js';
import { OBS_COMMANDS, ERRORS } from './Constants.js';

export default class OBSClient {
	client;
	password = "OB0n3P1n*dB";
	
	constructor() {
		this.client = new OBSWebSocket();
	}
	
	lookup(command) {
		return OBS_COMMANDS[command] || null;
	}

	async connect() {
		await this.client.connect({ 
			address: '10.51.1.184:4444', 
			password: this.password 
		});
		return this.client;
	}

	async send(command) {
		console.log(`Issuing command ${command}`);
		return new Promise((resolve, reject) => {
			const _key = this.lookup(command);
			if (!_key) throw new Error(ERRORS.INVALID_COMMAND);
			console.log(`Issuing TriggerHotkeyBySequence ${_key} to OBS`);

			this.client.send('TriggerHotkeyBySequence', { 
				keyId: _key,
				keyModifiers: { control: true }
			}).then(() => {
				resolve(command);
			}).catch(e => reject(e));
		});
	}
	
}
