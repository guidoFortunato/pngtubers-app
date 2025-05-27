import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function TwitchConnection({ onEvent }) {
  const [channel, setChannel] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('')

  useEffect(() => {
    // Configurar listeners de eventos de Twitch
    window.api.twitch.onChatMessage((data) => {
      setConnectionStatus('Conectado y recibiendo mensajes')
      onEvent('chatMessage', data)
    })
    window.api.twitch.onSubscription((data) => onEvent('subscription', data))
    window.api.twitch.onBits((data) => onEvent('bits', data))
    window.api.twitch.onFollow((data) => onEvent('follow', data))
  }, [onEvent])

  const handleConnect = async () => {
    if (!channel || !accessToken) {
      setError('Por favor ingresa el nombre del canal y el token de acceso')
      return
    }

    setConnectionStatus('Conectando...')
    setError('')
    setIsConnected(false)

    try {
      await window.api.twitch.connect(channel, accessToken)
      setIsConnected(true)
      setConnectionStatus('Conectado al canal')
      setError('')
    } catch (err) {
      setIsConnected(false)
      setError(err.message || 'Error al conectar con Twitch')
      setConnectionStatus('')
    }
  }

  const handleDisconnect = async () => {
    try {
      await window.api.twitch.disconnect()
      setIsConnected(false)
      setError('')
      setConnectionStatus('')
      // Limpiar los campos del formulario
      setChannel('')
      setAccessToken('')
      // Notificar al componente padre para limpiar la reacción
      onEvent('disconnect', null)
    } catch (err) {
      setError('Error al desconectar de Twitch: ' + err.message)
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Conexión con Twitch</h2>

      {!isConnected ? (
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Canal de Twitch</label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Nombre del canal"
              className="mt-1 block w-full text-sm p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Token de Acceso</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="OAuth token"
              className="mt-1 block w-full text-sm p-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {/* <p className="mt-3 text-sm text-gray-500">
              Obtén tu token en{' '}
              <a
                href="https://twitchtokengenerator.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                twitchtokengenerator.com
              </a>
            </p> */}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleConnect}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Conectar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-green-500">Conectado al canal: {channel}</p>
          {connectionStatus && <p className="text-sm text-gray-600">{connectionStatus}</p>}
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  )
}

TwitchConnection.propTypes = {
  onEvent: PropTypes.func.isRequired
}
