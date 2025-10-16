import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Send } from 'lucide-react';

export default function SORDAairController() {
  const [connected, setConnected] = useState(false);
  const [wingAngle, setWingAngle] = useState(0);
  const [inputAngle, setInputAngle] = useState(0);
  const [wsUrl, setWsUrl] = useState('');
  const [tempUrl, setTempUrl] = useState('ws://localhost:8080');
  const [feedback, setFeedback] = useState('');
  const [ws, setWs] = useState(null);

  const connectWebSocket = () => {
    if (!tempUrl.trim()) {
      setFeedback('Please enter a valid WebSocket URL');
      return;
    }

    try {
      const socket = new WebSocket(tempUrl);

      socket.onopen = () => {
        setConnected(true);
        setWsUrl(tempUrl);
        setFeedback('Connected to SORDA-air');
        setWs(socket);
      };

      socket.onerror = () => {
        setConnected(false);
        setFeedback('Connection failed. Check URL and try again.');
      };

      socket.onclose = () => {
        setConnected(false);
        setWs(null);
        setFeedback('Disconnected from SORDA-air');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.angle !== undefined) {
            setWingAngle(data.angle);
          }
        } catch (e) {
          console.log('Received:', event.data);
        }
      };
    } catch (e) {
      setFeedback('Invalid WebSocket URL format');
    }
  };

  const sendAngle = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const command = {
        type: 'setAngle',
        angle: parseFloat(inputAngle),
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(command));
      setWingAngle(parseFloat(inputAngle));
      setFeedback(`Wing angle set to ${inputAngle}°`);
    } else {
      setFeedback('Not connected to SORDA-air');
    }
  };

  const handleSliderChange = (value) => {
    setInputAngle(value);
  };

  const handleSliderRelease = () => {
    sendAngle();
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setConnected(false);
      setWs(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)'
         }}>
      
      {/* Floating clouds effect */}
      <div className="absolute top-8 left-12 w-24 h-12 bg-white rounded-full opacity-70 blur-sm"></div>
      <div className="absolute top-32 right-16 w-32 h-16 bg-white rounded-full opacity-60 blur-md"></div>
      <div className="absolute bottom-32 left-1/4 w-28 h-14 bg-white rounded-full opacity-50 blur-sm"></div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">SORDA-air</h1>
          <p className="text-xl text-blue-50 drop-shadow">Morphing Wing Control System</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          {/* Connection Status */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-blue-100">
            <div className="flex items-center gap-3">
              {connected ? (
                <>
                  <Wifi className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-red-500" />
                  <span className="text-lg font-semibold text-red-600">Disconnected</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {connected ? wsUrl : 'Not connected'}
            </div>
          </div>

          {/* Connection Controls */}
          {!connected ? (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                WebSocket URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={connectWebSocket}
                  className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg"
                >
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={disconnect}
              className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition mb-8"
            >
              Disconnect
            </button>
          )}

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${
              feedback.includes('Connected') || feedback.includes('set to')
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {feedback}
            </div>
          )}

          {/* Current Angle Display */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-8">
            <p className="text-gray-600 text-sm font-medium mb-2">Current Wing Angle</p>
            <p className="text-5xl font-bold text-blue-600">{wingAngle.toFixed(1)}°</p>
          </div>

          {/* Angle Control */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Set Wing Angle (0° - 90°)
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => handleSliderChange(e.target.value)}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                disabled={!connected}
                className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0°</span>
                <span>45°</span>
                <span>90°</span>
              </div>
            </div>

            {/* Manual Input */}
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => setInputAngle(Math.min(90, Math.max(0, e.target.value)))}
                disabled={!connected}
                placeholder="Enter angle"
                className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
              <button
                onClick={sendAngle}
                disabled={!connected}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Quick Presets</p>
          <div className="grid grid-cols-4 gap-3">
            {[0, 15, 45, 90].map((angle) => (
              <button
                key={angle}
                onClick={() => {
                  setInputAngle(angle);
                  setTimeout(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({ type: 'setAngle', angle }));
                      setWingAngle(angle);
                      setFeedback(`Wing angle set to ${angle}°`);
                    }
                  }, 50);
                }}
                disabled={!connected}
                className="py-3 px-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}