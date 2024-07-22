declare namespace TwitchEventSubType {
    type SessionWelcome = {
        metadata: {
            message_id: string,
            message_type: 'session_welcome',
            message_timestamp: string
        },
        payload: {
            session: {
                id: string,
                status: 'connected',
                connected_at: string,
                keepalive_timeout_seconds: number,
                reconnect_url: null
            }
        }
    }

    type KeepaliveMessage = {
        metadata: {
            message_id: string,
            message_type: 'session_keepalive',
            message_timestamp: string
        },
        payload: {}
    }

    type SubscriptionType = 'channel.follow' | 'channel.chat.message' | 'channel.subscribe' | 'channel.raid' | 'channel.subscription.gift'

    type FollowEvent = {
        user_id: string,
        user_login: string,
        user_name: string,
        broadcaster_user_id: string,
        broadcaster_user_login: string,
        broadcaster_user_name: string,
        followed_at: string
    }

    type NotificationMessage = {
        metadata: {
            message_id: string,
            message_type: 'notification',
            message_timestamp: string,
            subscription_type: TwitchEventSubType.SubscriptionType,
            subscription_version: string
        },
        payload: {
            subscription: {
                id: string,
                status: 'enabled',
                type: TwitchEventSubType.SubscriptionType,
                version: string,
                cost: number,
                condition: {
                    broadcaster_user_id: string
                },
                "transport": {
                    method: 'websocket',
                    session_id: string
                },
                created_at: string
            },
            event: any
        }
    }

    type ReconnectMessage = {
        metadata: {
            message_id: string,
            message_type: 'session_reconnect',
            message_timestamp: string
        },
        payload: {
            session: {
                id: string,
                status: 'reconnecting',
                keepalive_timeout_seconds: null,
                reconnect_url: string,
                connected_at: string
            }
        }
    }

    type RevocationMessage = {
        metadata: {
            message_id: string,
            message_type: 'revocation',
            message_timestamp: string,
            subscription_type: 'channel.follow',
            subscription_version: string
        },
        payload: {
            subscription: {
                id: string,
                status: 'authorization_revoked',
                type: TwitchEventSubType.SubscriptionType,
                version: string,
                cost: number,
                condition: {
                    broadcaster_user_id: string
                },
                transport: {
                    method: 'websocket',
                    session_id: string
                },
                created_at: string
            }
        }
    }
}
