import { ApiClient } from 'twitch';
import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { promises as fs } from 'fs';
import axios from 'axios';
import { URI } from '../lib/Constants.js';

export default class TwitchClient {
	apiClient;
	authProvider;
	tokensFile;
	secret = "grkbm2i9t7sap4hmzeg0gaiell6ptw";
	id = "g2xp612kg83allsw26324imkvlztzn";
	
	_scopes = ['user:edit','user:read:broadcast','chat:read', 'chat:edit', 'channel:read:subscriptions'];
	
	constructor(tokensFile) {
		this.tokensFile = tokensFile;
	}
	
	get client() {
		return this.apiClient;
	}
	
	get scopes() {
		return this._scopes.join('%20');
	}
	
	async readTokens() {
		const file = await fs.readFile(this.tokensFile, 'utf-8');
		return JSON.parse(file);
	}
	
	getAuthorizeUri(redirect) {
		return `https://id.twitch.tv/oauth2/authorize?client_id=${this.id}&redirect_uri=${redirect}&response_type=code&scope=${this.scopes}`;
	}
	
	generateRefreshableToken() {
		return new RefreshableAuthProvider(
			new StaticAuthProvider(this.id, this.tokens.accessToken, this.scopes), 
			{
				clientSecret: this.secret,
				refreshToken: this.tokens.refreshToken,
				expiry: this.tokens.expiryTimestamp === null ? null : new Date(this.tokens.expiryTimestamp),
				onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
					const newTokenData = {
						accessToken,
						refreshToken,
						expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
					};
					await fs.writeFile(this.tokensFile, JSON.stringify(newTokenData, null, 4), 'utf-8');
				}
			}
		);
	}
	
	async init(authType, code) {
		if (authType === 'authorize') {
			this.tokens = await this.getOauthAuthorization(code, `${URI.NGROK_MAIN}/stream`);
		}else{
			this.tokens = await this.getOauthToken();
		}
		await fs.writeFile(this.tokensFile, JSON.stringify(this.tokens, null, 4), 'utf-8');
		console.log(this.tokens);
		this.authProvider = this.generateRefreshableToken();
		// this.authProvider = new ClientCredentialsAuthProvider(this.id, this.secret);
		this.apiClient = new ApiClient({ authProvider: this.authProvider });
		return this;
	}
	
	async getOauthAuthorization(code, redirect) {
		const endpoint = `https://id.twitch.tv/oauth2/token?client_id=${this.id}&client_secret=${this.secret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirect}`;
		console.log(endpoint);
		const resp = await axios.post(endpoint);
		return { 
			accessToken: resp.data.access_token, 
			refreshToken: resp.data.refresh_token,
			expiryTimestamp: resp.data.expires_in,
			tokenType: resp.data.token_type,
			scope: resp.data.scope
		};
	}
	
	async getOauthToken() {
		const endpoint = `https://id.twitch.tv/oauth2/token?client_id=${this.id}&client_secret=${this.secret}&grant_type=client_credentials&scope=${this.scopes}`;
		const resp = await axios.post(endpoint);
		return  { 
			accessToken: resp.data.access_token, 
			refreshToken: resp.data.refresh_token || null,
			expiryTimestamp: resp.data.expires_in,
			tokenType: resp.data.token_type,
			scope: resp.data.scope
		};
	}
	
	async isStreamLive(username) {
		console.log(await this.client.getTokenInfo());
		const user = await this.client.helix.users.getUserByName('kinikxulkahn');
		console.log('user', user.id, 'username', username);
		if (!user) return false;
		const stream = await this.client.helix.streams.getStreamByUserId(user.id);
		return !!stream;
	}
}
