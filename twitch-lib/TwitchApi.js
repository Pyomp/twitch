import { env } from "../env.js"
import { TwitchAuthenticationApi } from "./TwitchAuthenticationApi.js"
import { TwitchEventSubApi } from "./TwitchEventSubApi.js"
import { TwitchEventSubWebsocket } from "./TwitchEventSubWebsocket.js"

export class TwitchApi {
    authenticationApi = new TwitchAuthenticationApi(env.twitch.clientId, env.twitch.secretId)

    eventSubApi = new TwitchEventSubApi(this.authenticationApi)

    eventSubWebsocket = new TwitchEventSubWebsocket()

    #subscriptions = new Map()

    async init() {
        await this.authenticationApi.init()

        await this.eventSubApi.init()

        await this.eventSubWebsocket.connect()

        this.eventSubWebsocket.newSessionWelcomeListeners.add(this.#onNewSessionWelcome.bind(this))
        this.eventSubWebsocket.eventListeners.add(this.#onEvent.bind(this))
    }

    #onEvent(event) {
        if (this.#subscriptions.has(event?.subscription?.type)) {
            this.#subscriptions.get(event?.subscription?.type)(event)
        }
    }

    #onNewSessionWelcome() {
        for (const subscriptionName of this.#subscriptions.keys()) {
            this.eventSubApi.createEventSub(this.eventSubWebsocket.sessionId, subscriptionName)
        }
    }

    /**
     * @param {TwitchEventSubType.SubscriptionType} subscriptionName
     */
    sub(subscriptionName, listener) {
        if (this.#subscriptions.has(subscriptionName)) return

        this.#subscriptions.set(subscriptionName, listener)

        this.eventSubApi.createEventSub(this.eventSubWebsocket.sessionId, subscriptionName)
    }
}
