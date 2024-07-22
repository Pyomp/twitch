import { jsonLocalStorage } from "../js-lib/utils/jsonLocalStorage.js"
import { CopyButton } from "../views/CopyButton.js"
import { ModalView } from "../views/ModalView.js"

const scopes = [
    'analytics:read:extensions', // View analytics data for the Twitch Extensions owned by the authenticated account.
    'analytics:read:games', // View analytics data for the games owned by the authenticated account.
    'bits:read', // View Bits information for a channel.
    'channel:manage:ads', // Manage ads schedule on a channel.
    'channel:read:ads', // Read the ads schedule and details on your channel.
    'channel:manage:broadcast', // Manage a channel’s broadcast configuration, including updating channel configuration and managing stream markers and stream tags.
    'channel:read:charity', // Read charity campaign details and user donations on your channel.
    'channel:edit:commercial', // Run commercials on a channel.
    'channel:read:editors', // View a list of users with the editor role for a channel.
    'channel:manage:extensions', // Manage a channel’s Extension configuration, including activating Extensions.
    'channel:read:goals', // View Creator Goals for a channel.
    'channel:read:guest_star', // Read Guest Star details for your channel.
    'channel:manage:guest_star', // Manage Guest Star for your channel.
    'channel:read:hype_train', // View Hype Train information for a channel.
    'channel:manage:moderators', // Add or remove the moderator role from users in your channel.
    'channel:read:polls', // View a channel’s polls.
    'channel:manage:polls', // Manage a channel’s polls.
    'channel:read:predictions', // View a channel’s Channel Points Predictions.
    'channel:manage:predictions', // Manage of channel’s Channel Points Predictions
    'channel:manage:raids', // Manage a channel raiding another channel.
    'channel:read:redemptions', // View Channel Points custom rewards and their redemptions on a channel.
    'channel:manage:redemptions', // Manage Channel Points custom rewards and their redemptions on a channel.
    'channel:manage:schedule', // Manage a channel’s stream schedule.
    'channel:read:stream_key', // View an authorized user’s stream key.
    'channel:read:subscriptions', // View a list of all subscribers to a channel and check if a user is subscribed to a channel.
    'channel:manage:videos', // Manage a channel’s videos, including deleting videos.
    'channel:read:vips', // Read the list of VIPs in your channel.
    'channel:manage:vips', // Add or remove the VIP role from users in your channel.
    'clips:edit', // Manage Clips for a channel.
    'moderation:read', // View a channel’s moderation data including Moderators, Bans, Timeouts, and Automod settings.
    'moderator:manage:announcements', // Send announcements in channels where you have the moderator role.
    'moderator:manage:automod', // Manage messages held for review by AutoMod in channels where you are a moderator.
    'moderator:read:automod_settings', // View a broadcaster’s AutoMod settings.
    'moderator:manage:automod_settings', // Manage a broadcaster’s AutoMod settings.
    'moderator:manage:banned_users', // Ban and unban users.
    'moderator:read:blocked_terms', // View a broadcaster’s list of blocked terms.
    'moderator:manage:blocked_terms', // Manage a broadcaster’s list of blocked terms.
    'moderator:manage:chat_messages', // Delete chat messages in channels where you have the moderator role
    'moderator:read:chat_settings', // View a broadcaster’s chat room settings.
    'moderator:manage:chat_settings', // Manage a broadcaster’s chat room settings.
    'moderator:read:chatters', // View the chatters in a broadcaster’s chat room.
    'moderator:read:followers', // Read the followers of a broadcaster.
    'moderator:read:guest_star', // Read Guest Star details for channels where you are a Guest Star moderator.
    'moderator:manage:guest_star', // Manage Guest Star for channels where you are a Guest Star moderator.
    'moderator:read:shield_mode', // View a broadcaster’s Shield Mode status.
    'moderator:manage:shield_mode', // Manage a broadcaster’s Shield Mode status.
    'moderator:read:shoutouts', // View a broadcaster’s shoutouts.
    'moderator:manage:shoutouts', // Manage a broadcaster’s shoutouts.
    'moderator:read:unban_requests', // View a broadcaster’s unban requests.
    'moderator:manage:unban_requests', // Manage a broadcaster’s unban requests.
    'moderator:read:warnings', // Read warnings in channels where you have the moderator role.
    'moderator:manage:warnings', // Warn users in channels where you have the moderator role.
    'user:edit', // Manage a user object.
    'user:edit:follows', // Deprecated. Was previously used for “Create User Follows” and “Delete User Follows.” See Deprecation of Create and Delete Follows API Endpoints.
    'user:read:blocked_users', // View the block list of a user.
    'user:manage:blocked_users', // Manage the block list of a user.
    'user:read:broadcast', // View a user’s broadcasting configuration, including Extension configurations.
    'user:manage:chat_color', // Update the color used for the user’s name in chat.Update User Chat Color
    'user:read:email', // View a user’s email address.
    'user:read:emotes', // View emotes available to a user
    'user:read:follows', // View the list of channels a user follows.
    'user:read:moderated_channels', // Read the list of channels you have moderator privileges in.
    'user:read:subscriptions', // View if an authorized user is subscribed to specific channels.   
    'user:manage:whispers', // Read whispers that you send and receive, and send whispers on your behalf.

    'channel:bot',// Allows the client’s bot users access to a channel.
    'channel:moderate',// Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.
    'chat:edit',// Send live stream chat messages using an IRC connection.
    'chat:read',// View live stream chat messages using an IRC connection.
    'user:bot',// Allows client’s bot to act as this user.
    'user:read:chat',// View live stream chat and room messages using EventSub.
    'user:write:chat',// Send live stream chat messages using Send Chat Message API.
    'whispers:read',// View your whisper messages.
    'whispers:edit',// Send whisper messages.
]

export class TwitchAuthenticationApi {
    clientId

    #clientSecret

    tokenDeviceResponse

    #localStorageKey

    scopes = scopes.join(' ')

    get token() {
        return `${this.tokenDeviceResponse?.token_type?.[0].toUpperCase() + this.tokenDeviceResponse?.token_type?.slice(1)} ${this.tokenDeviceResponse?.access_token}`
    }

    constructor(clientId, clientSecret, localStorageKey = 'TwitchAuthenticationApi') {
        this.clientId = clientId
        this.#clientSecret = clientSecret
        this.#localStorageKey = localStorageKey
        this.tokenDeviceResponse = jsonLocalStorage.get(`${this.#localStorageKey}.tokenDeviceResponse`)
    }

    async init() {
        await this.#initDeviceAuthToken()
    }

    async #initDeviceAuthToken() {
        if (this.tokenDeviceResponse?.access_token) return

        const deviceResponse = await (await fetch('https://id.twitch.tv/oauth2/device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${this.clientId}&scopes=${encodeURIComponent(this.scopes)}`
        })).json()

        localStorage.setItem('twitch_event_sub_api_device_auth', JSON.stringify(deviceResponse))

        const modal = this.#displayPermissionModal(deviceResponse.verification_uri)

        this.tokenDeviceResponse = await new Promise((resolve) => {
            const intervalId = setInterval(async () => {
                const result = await this.#getTokenFromDeviceCode(deviceResponse.device_code)

                if (result.access_token) {
                    clearInterval(intervalId)
                    resolve(result)
                }
            }, 2000)
        })

        modal.dispose()

        jsonLocalStorage.set(`${this.#localStorageKey}.tokenDeviceResponse`, this.tokenDeviceResponse)
    }

    #displayPermissionModal(verificationUri) {
        const container = document.createElement('div')
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.justifyContent = 'center'

        const title = document.createElement('div')
        title.textContent = 'Open in your browser and authorize the app.'
        container.appendChild(title)

        const copyButton = new CopyButton({ textToCopy: verificationUri })
        container.appendChild(copyButton.htmlElement)

        return new ModalView({ element: container })
    }

    async #refreshToken() {
        const refreshTokenResult = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=refresh_token'
                + `&refresh_token=${this.tokenDeviceResponse?.refresh_token}`
                + `&client_id=${this.clientId}`
                + `&client_secret=${this.#clientSecret}`
        })

        if (refreshTokenResult.ok) {
            this.tokenDeviceResponse = await refreshTokenResult.json()
            jsonLocalStorage.set(`${this.#localStorageKey}.tokenDeviceResponse`, this.tokenDeviceResponse)
        } else {
            this.#resetToken()
        }
    }

    #resetToken() {
        this.tokenDeviceResponse = undefined
        localStorage.removeItem(`${this.#localStorageKey}.tokenDeviceResponse`)
    }

    async shouldRetry(response) {
        if (response.ok) {
            return false
        } else {
            if (response.status === 401) {
                await this.#refreshToken()
                if (this.tokenDeviceResponse?.access_token) {
                    return true
                } else {
                    this.#resetToken()
                    return false
                }
            }
            this.#resetToken()
            return false
        }
    }

    async #getTokenFromDeviceCode(device_code) {
        const form = new FormData()
        form.append('client_id', this.clientId)
        form.append('scopes', this.scopes)
        form.append('device_code', device_code)
        form.append('grant_type', 'urn:ietf:params:oauth:grant-type:device_code')

        console.log(JSON.stringify(form))

        return (await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            body: form
        })).json()
    }
}
