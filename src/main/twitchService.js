import tmi from 'tmi.js'
import { ipcMain } from 'electron'
// import { TWITCH_CONFIG } from './config'

class TwitchService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.channel = ''
  }

  async connect(channel, accessToken) {
    if (this.isConnected) {
      await this.disconnect()
    }

    this.channel = channel.toLowerCase()

    this.client = new tmi.Client({
      options: { debug: true },
      connection: {
        secure: true,
        reconnect: true
      },
      identity: {
        username: channel,
        password: `oauth:${accessToken}`
      },
      channels: [this.channel]
    })

    try {
      await this.client.connect()
      this.isConnected = true
      this.setupEventHandlers()
      return true
    } catch (error) {
      console.error('Error connecting to Twitch:', error)
      return false
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect()
      this.isConnected = false
      this.client = null
    }
  }

  setupEventHandlers() {
    if (!this.client) return

    // Mensajes del chat
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return // Ignorar mensajes propios

      // Emitir evento de mensaje
      this.emit('chatMessage', {
        channel,
        username: tags.username,
        message,
        isSubscriber: tags.subscriber,
        isMod: tags.mod
      })
    })

    // Suscripciones
    this.client.on('subscription', (channel, username, method, message, userstate) => {
      this.emit('subscription', {
        channel,
        username,
        method,
        message,
        months: userstate['msg-param-cumulative-months']
      })
    })

    // Bits
    this.client.on('cheer', (channel, userstate, message) => {
      this.emit('bits', {
        channel,
        username: userstate.username,
        bits: userstate.bits,
        message
      })
    })

    // Seguidores
    this.client.on('follow', (channel, username, method, message) => {
      this.emit('follow', {
        channel,
        username,
        method,
        message
      })
    })
  }

  emit(event, data) {
    // Enviamos el evento al proceso de renderizado usando el canal específico
    ipcMain.emit(`twitch:${event}`, data)
  }
}

export const twitchService = new TwitchService()
