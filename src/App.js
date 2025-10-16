import React, { useState } from 'react';
import './App.css';
import { Wifi, WifiOff, Send } from 'lucide-react';

function App() {
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
    <div className="container">
      <div className="clouds cloud1"></div>
      <div className="clouds cloud2"></div>
      <div className="clouds cloud3"></div>

      <div className="content">
        <div className="header">
          <h1>SORDA-air</h1>
          <p>Morphing Wing Control System</p>
        </div>

        <div className="card main-card">
          <div className="status-bar">
            <div className="status-info">
              {connected ? (
                <>
                  <Wifi size={24} className="icon-green" />
                  <span className="status-connected">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={24} className="icon-red" />
                  <span className="status-disconnected">Disconnected</span>
                </>
              )}
            </div>
            <div className="status-url">
              {connected ? wsUrl : 'Not connected'}
            </div>
          </div>

          {!connected ? (
            <div className="connection-section">
              <label>WebSocket URL</label>
              <div className="url-input-group">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                  className="url-input"
                />
                <button onClick={connectWebSocket} className="btn btn-connect">
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <button onClick={disconnect} className="btn btn-disconnect">
              Disconnect
            </button>
          )}

          {feedback && (
            <div className={`feedback ${
              feedback.includes('Connected') || feedback.includes('set to')
                ? 'feedback-success'
                : 'feedback-info'
            }`}>
              {feedback}
            </div>
          )}

          <div className="angle-display">
            <p>Current Wing Angle</p>
            <p className="angle-value">{wingAngle.toFixed(1)}°</p>
          </div>

          <div className="control-section">
            <div className="slider-group">
              <label>Set Wing Angle (0° - 90°)</label>
              <input
                type="range"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => handleSliderChange(e.target.value)}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                disabled={!connected}
                className="slider"
              />
              <div className="slider-labels">
                <span>0°</span>
                <span>45°</span>
                <span>90°</span>
              </div>
            </div>

            <div className="input-group">
              <input
                type="number"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => setInputAngle(Math.min(90, Math.max(0, e.target.value)))}
                disabled={!connected}
                placeholder="Enter angle"
                className="number-input"
              />
              <button
                onClick={sendAngle}
                disabled={!connected}
                className="btn btn-send"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="card presets-card">
          <p className="presets-label">Quick Presets</p>
          <div className="presets-grid">
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
                className="preset-btn"
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

export default App;
