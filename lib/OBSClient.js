import OBSWebSocket from 'obs-websocket-js';

export default class OBSClient {
	client;
	password = "OB0n3P1n*dB";
	
	constructor() {
		this.client = new OBSWebSocket();
	}
	
	async connect() {
		await this.client.connect({ 
			address: '10.51.1.184:4444', 
			password: this.password 
		});
		return this.client;
	}
	
}
