const KeepAliveConfig = 60
const KeepAliveTimeout = (KeepAliveConfig + 10) * 1000

export class TwitchEventSubWebsocket {
    sessionId

    /** @type {WebSocket} */
    #ws

    isAliveTimeout

    constructor() { }

    #connectResolve

    newSessionWelcomeListeners = new Set()

    connect() {
        return new Promise((resolve) => {
            this.#ws = new WebSocket(`wss://eventsub.wss.twitch.tv/ws?keepalive_timeout_seconds=${KeepAliveConfig}`)

            this.#connectResolve = resolve

            this.#ws.onopen = () => {
                this.isAliveTimeout = setTimeout(() => { this.#ws.close() }, KeepAliveTimeout)
            }
            this.#ws.onmessage = this.#onMessage.bind(this)
            this.#ws.onclose = this.#onClose.bind(this)
        })
    }

    /**
     * 
     * @param {TwitchEventSubType.SessionWelcome} data 
     */
    #onSessionWelcome(data) {
        this.sessionId = data.payload.session.id
        
        for (const listener of this.newSessionWelcomeListeners) listener()

        this.#connectResolve()
    }

    #onKeepAlive() {
        clearTimeout(this.isAliveTimeout)
        this.isAliveTimeout = setTimeout(() => { this.#ws.close() }, KeepAliveTimeout)
    }


    /** @type { Set<(event: TwitchEventSubType.NotificationMessage['payload']) => void> } */
    eventListeners = new Set()

    /**
     * @param {TwitchEventSubType.NotificationMessage} data 
     */
    #onNotification(data) {
        for (const listener of this.eventListeners) listener(data.payload)
        console.dir(data)
    }

    #onMessage(event) {
        try {
            console.dir(event)

            /** @type {TwitchEventSubType.SessionWelcome | TwitchEventSubType.NotificationMessage |TwitchEventSubType.KeepaliveMessage | TwitchEventSubType.RevocationMessage | TwitchEventSubType.ReconnectMessage} */
            const data = JSON.parse(event.data)

            if (data.metadata.message_type === 'session_welcome') {
                this.#onSessionWelcome(data)
            } else if (data.metadata.message_type === 'notification') {
                this.#onNotification(data)
            } else if (data.metadata.message_type === 'session_keepalive') {
                this.#onKeepAlive()
            } else if (data.metadata.message_type === 'session_reconnect') {
                this.#ws.close()
            } else if (data.metadata.message_type === 'revocation') {

            }

        } catch (e) {
            console.error(e)
            console.dir(event)
        }
    }

    #onClose(e) {
        setTimeout(() => { this.connect() }, 1_000)
        console.dir(e)
    }
}
