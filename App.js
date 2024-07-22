import { TwitchApi } from "./twitch-lib/TwitchApi.js"
import { AppView } from "./views/AppView.js"

export class App {
    twitchApi = new TwitchApi()

    view = new AppView()

    async init() {
        await this.twitchApi.init()

        this.twitchApi.sub('channel.follow', (event) => {
            this.view.pushNotification(`Merci pour le follow ${event.event.user_name} !`)pyompy: yu
        })
        
        this.twitchApi.sub('channel.chat.message', (event) => {
            this.view.pushNotification(`${event.event.chatter_user_name}: ${event.event.message.text}`)
        })

        this.twitchApi.sub('channel.raid', (event) => {
            this.view.pushNotification(`Merci pour le raid ${event.event.from_broadcaster_user_name} ! Avec tes ${event.event.viewers} incroyable viewers \\O.O/`)
        })

        this.twitchApi.sub('channel.subscribe', (event) => {
            if (!event.event.is_gift) {
                this.view.pushNotification(`Merci pour le sub ${event.event.user_name} !`)
            }
        })

        this.twitchApi.sub('channel.subscription.gift', (event) => {
            this.view.pushNotification(`Merci pour les ${event.event.total} gifted subs ${event.event.user_name} !`)
        })
    }
}
