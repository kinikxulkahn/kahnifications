import TwitchClient from './TwitchClient.js';
import OBSClient from './OBSClient.js';
import { URI, STRINGS, CONFIG, EMOTE_COMMANDS } from './Constants.js';
import { ApiClient } from 'twitch';
import { StaticAuthProvider, ClientCredentialsAuthProvider } from 'twitch-auth';
import { SimpleAdapter, WebHookListener } from 'twitch-webhooks';
import { ChatClient } from 'twitch-chat-client';
import webpush from 'web-push';
import detect from 'detect-port';
import Storage from './Storage.js';


export default class TwitchChat {
	
	obs;
	twitch;
	client;
	stream;
	listener;
	username;
	subscriptions = [];
	port = 8090;
	isLive = false;
	state = {
		position: 'left'
	};


	constructor(username) {
		this.storage = new Storage(true);
		this.username = username;
		this.twitch = new TwitchClient('./store/tokens.json');
	}
	
	*isPortInUse(port) {
		const _port = yield detect(port);
		return _port !== port;
	}

	subscribe(subscription) {
		this.subscriptions.push(subscription);
	}

	notify(payload) {
		this.subscriptions.forEach(sub => {
			webpush.sendNotification(sub, JSON.stringify(payload)).catch(error => {
				console.error(error.stack);
			});
		});
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
		if (!this.isPortInUse(this.port)) {
			this.listener = new WebHookListener(apiClient, new SimpleAdapter({
				hostName: URI.NGROK_PUBSUB,
				listenerPort: this.port
			}));
			this.listener.subscribeToFollowsToUser(user.id, this.onFollow.bind(this));
			await this.listener.listen();
		}
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
	
	parseCommand(message) {
		return  /^!/.test(message) ? message.split(' ')[0].replace('!', '').toUpperCase() : "NULL";
	}

	parseMessage(message) {
		const _command = this.parseCommand(message);
		const _message = _command ? message.split(' ', 2)[1] : "";

		return {
			_command,
			_message
		};
	}

	async onMessage(channel, user, message, msg) {
		console.log(message);
		const { _command, _message } = this.parseMessage(message);
		console.log(_command, _message);
		console.log(`Looking up ${_command}`);
		
		if (!!EMOTE_COMMANDS[_command]) {
			console.log(`Invoking emote command ${_command}`);
			const parsed = msg.parseEmotes();
			console.log(parsed);
			const emotes = parsed.filter(part => part.type === 'emote').map(emote => { 
				return {
					type: emote.type,
					name: emote.name,
					id: emote.id
				}
			});
			const texts = parsed.filter(part => part.type === 'text').map(text => { 
				return {
					type: text.type,
					text: text.text
				}
			});

			if (emotes && emotes.length) {
				console.log('Saving emotes', emotes);
				this.storage.save('emotes', emotes, () => {
					this.client.say(channel, `@${user} ${STRINGS[CONFIG.lang].YOUR_OFFERING_WAS_ACCEPTED}`);
				});
			}
			if (texts && texts.length) {
				const prayer = texts.map(text => text.text.split(' ').join('').replace(/\W+/g, '')).join('');
				console.log('Saving prayers', prayer);
				this.storage.save('prayers', { 
					type: 'prayer',
					chars: prayer
				}, () => {
					this.client.say(channel, `@${user} ${STRINGS[CONFIG.lang].YOUR_OFFERING_WAS_ACCEPTED}`);
				});
			}
			return;
		}

		if (this.state.position !== _command) {
			try {
				this.state.position = await this.obs.send(_command);
				this.client.say(channel, `@${user} ${STRINGS[CONFIG.lang].YOUR_PRAYER_HAS_BEEN_ANSWERED}`);
			} catch(e) {
				//this.client.say(channel, `@${user} ${STRINGS[CONFIG.lang].YOUR_PRAYER_HAS_FALLEN_ON_DEAF_EARS}`);
			}	
		}
	}
	
}
