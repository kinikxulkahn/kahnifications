import TwitchClient from './TwitchClient.js';
import OBSClient from './OBSClient.js';
import { URI } from './Constants.js';
import { ApiClient } from 'twitch';
import { StaticAuthProvider, ClientCredentialsAuthProvider } from 'twitch-auth';
import { SimpleAdapter, WebHookListener } from 'twitch-webhooks';
import { ChatClient } from 'twitch-chat-client';


export default class TwitchChat {
	
	obs;
	twitch;
	client;
	stream;
	listener;
	username;
	isLive = false;
	state = {
		position: 'left'
	};
	
	constructor(username) {
		this.username = username;
		this.twitch = new TwitchClient('./store/tokens.json');
	}
	
	async init() {
		const getToken = async () => {
			console.log('getToken');
			try {
			  this.api = await twitchClient.init('authorize', req.query.code);
			  const resp = await apiClient.isStreamLive(this.username);
			  this.isLive = !!resp.data;
			}catch(e){
			  throw new Error(e);
			}
		}
		
		try { 
			await getToken();
			if (this.isLive) await this.connect();
		}catch(e) {
			throw new Error(e);
		}
	}
	
	async connect() {
		// Connect to OBS
		this.obs = new OBSClient();
		await this.obs.connect();
		const tokens = await this.twitch.readTokens();
		console.log(tokens);
		const apiClient = new ApiClient({
			authProvider: new ClientCredentialsAuthProvider(this.twitch.id, this.twitch.secret)
		});
		const user = await apiClient.helix.users.getUserByName(this.username);
		// Listen for Twitch Webhooks
		this.listener = new WebHookListener(apiClient, new SimpleAdapter({
			hostName: URI.NGROK_PUBSUB,
			listenerPort: 8090
		}));
		this.listener.subscribeToFollowsToUser(user.id, this.onFollow.bind(this));
		await this.listener.listen();
		// Connect to Twitch Chat Client
		const staticAuth = new StaticAuthProvider(this.twitch.id, tokens.accessToken);
		this.client = new ChatClient(staticAuth, { channels: [this.username] });
		this.client.onMessage(this.onMessage.bind(this));
		this.client.onSub(this.onSub.bind(this));
		this.client.onResub(this.onResub.bind(this));
		this.client.onSubGift(this.onSubGift.bind(this));
		// set up listeners
		await this.client.connect();
	}
	
	async onFollow(follow) {
		this.obs.client.send('SetCurrentScene', { 
			'scene-name': 'New Follower'
		}).then(() => {
			this.client.say(channel, `@${follow.userDisplayName} Welcome Jungling!`);
		}).catch(e => console.error(e));
	}
	
	onSub(channel, user) {
		this.obs.client.send('SetCurrentScene', { 
			'scene-name': 'New Subscriber'
		}).then(() => {
			this.client.say(channel, `@${user} has ascended!`);
		}).catch(e => console.error(e));
	}
	
	onResub(channel, user, subInfo) {
		this.obs.client.send('SetCurrentScene', { 
			'scene-name': 'New Subscriber'
		}).then(() => {
			this.client.say(channel, `@${user} has ascended!`);
		}).catch(e => console.error(e));
	}
	
	onSubGift(channel, user, subInfo) {
		this.obs.client.send('SetCurrentScene', { 
			'scene-name': 'New Subscriber'
		}).then(() => {
			this.client.say(channel, `@${subInfo.gifter} granted ascension to ${user}!`);
		}).catch(e => console.error(e));
	}
	
	onMessage(channel, user, message) {
		if (message === '!left' && this.state.position !== 'left') {
			this.obs.client.send('TriggerHotkeyBySequence', { 
				keyId: 'OBS_KEY_1',
				keyModifiers: { control: true }
			}).then(() => {
				this.state.position = 'left';
				this.client.say(channel, `@${user} your prayer has been answered`);
			}).catch(e => console.error(e));
		} else if (message === '!right' && this.state.position !== 'right') {
			this.obs.client.send('TriggerHotkeyBySequence', { 
				keyId: 'OBS_KEY_2',
				keyModifiers: { control: true }
			}).then(() => {
				this.state.position = 'right';
				this.client.say(channel, `@${user} your prayer has been answered`);
			}).catch(e => console.error(e));
		} else if (message === '!top' && this.state.position !== 'top') {
			this.obs.client.send('TriggerHotkeyBySequence', { 
				keyId: 'OBS_KEY_3',
				keyModifiers: { control: true }
			}).then(() => {
				this.state.position = 'top';
				this.client.say(channel, `@${user} your prayer has been answered`);
			}).catch(e => console.error(e));
		} else if (message === '!bottom' && this.state.position !== 'bottom') {
			this.obs.client.send('TriggerHotkeyBySequence', { 
				keyId: 'OBS_KEY_4',
				keyModifiers: { control: true }
			}).then(() => {
				this.state.position = 'bottom';
				this.client.say(channel, `@${user} your prayer has been answered`);
			}).catch(e => console.error(e));
		}
	}
	
}
