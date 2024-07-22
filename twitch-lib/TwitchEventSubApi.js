import { TwitchAuthenticationApi } from "./TwitchAuthenticationApi.js"

export class TwitchEventSubApi {
    get #token() {
        return this.#twitchAuthenticationApi.token
    }

    #clientId = ''

    #userId = ''

    #twitchAuthenticationApi

    constructor(
        /** @type {TwitchAuthenticationApi} */ twitchAuthenticationApi
    ) {
        this.#clientId = twitchAuthenticationApi.clientId
        this.#twitchAuthenticationApi = twitchAuthenticationApi
    }

    async init() {
        const getUserResponse = await this.getUser()
        this.#userId = getUserResponse.data[0].id
    }

    async getUser() {
        const response = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': this.#token,
                'Client-Id': this.#clientId
            },
        })

        // if (await this.#twitchAuthenticationApi.shouldRetry(response)) {
        //     return this.getUser()
        // }

        return response.json()
    }

    /**
     * 
     * @param {string} sessionId 
     * @param {keyof EventSubType} type 
     */
    createEventSub(sessionId, type, condition) {
        return fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': this.#token,
                'Client-Id': this.#clientId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": EventSubType[type].name,
                "version": EventSubType[type].version,
                "condition": EventSubType[type].createCondition(this.#userId),
                "transport": {
                    method: 'websocket',
                    session_id: sessionId
                }
            })
        })
    }
}

const EventSubType = {
    'channel.follow': {
        name: 'channel.follow',
        version: '2',
        createCondition: (userId) => ({
            "broadcaster_user_id": userId,
            "moderator_user_id": userId
        })
    },
    'channel.chat.message': {
        name: 'channel.chat.message',
        version: '1',
        createCondition: (userId) => ({
            "broadcaster_user_id": userId,
            "user_id": userId
        })
    },
    'channel.subscribe': {
        name: 'channel.subscribe',
        version: '1',
        createCondition: (userId) => ({
            "broadcaster_user_id": userId
        })
    },
    'channel.raid': {
        name: 'channel.raid',
        version: '1',
        createCondition: (userId) => ({
            // "from_broadcaster_user_id": userId,
            "to_broadcaster_user_id": userId
        })
    },
    'channel.subscription.gift': {
        name: 'channel.subscription.gift',
        version: '1',
        createCondition: (userId) => ({
            "broadcaster_user_id": userId
        })
    }
}
