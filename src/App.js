import { useState } from 'react';
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

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    clouds: {
      position: 'absolute',
      backgroundColor: 'white',
      borderRadius: '50%',
      filter: 'blur(8px)'
    },
    cloud1: {
      width: '96px',
      height: '48px',
      top: '32px',
      left: '48px',
      opacity: 0.7
    },
    cloud2: {
      width: '128px',
      height: '64px',
      top: '128px',
      right: '64px',
      opacity: 0.6,
      filter: 'blur(16px)'
    },
    cloud3: {
      width: '112px',
      height: '56px',
      bottom: '128px',
      left: '25%',
      opacity: 0.5
    },
    content: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '800px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    h1: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
      marginBottom: '8px'
    },
    headerP: {
      fontSize: '20px',
      color: 'rgba(255, 255, 255, 0.95)',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      padding: '32px',
      marginBottom: '32px'
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '2px solid #E0F4FF'
    },
    statusInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    statusConnected: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#22c55e'
    },
    statusDisconnected: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ef4444'
    },
    statusUrl: {
      fontSize: '14px',
      color: '#666'
    },
    connectionSection: {
      marginBottom: '32px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '12px'
    },
    urlInputGroup: {
      display: 'flex',
      gap: '8px'
    },
    urlInput: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #93c5fd',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    btn: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      transition: 'all 0.3s'
    },
    btnConnect: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    btnDisconnect: {
      width: '100%',
      backgroundColor: '#ef4444',
      color: 'white',
      marginBottom: '32px'
    },
    btnSend: {
      background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
      color: 'white'
    },
    feedback: {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '24px',
      fontSize: '14px',
      fontWeight: 500
    },
    feedbackSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    feedbackInfo: {
      backgroundColor: '#dbeafe',
      color: '#0c4a6e'
    },
    angleDisplay: {
      background: 'linear-gradient(to right, #f0f9ff, #f0f9ff)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      textAlign: 'center'
    },
    angleValue: {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#0284c7',
      margin: 0
    },
    controlSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    sliderGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    slider: {
      width: '100%',
      height: '12px',
      borderRadius: '8px',
      outline: 'none',
      appearance: 'none',
      background: '#bfdbfe',
      cursor: 'pointer',
      marginBottom: '8px'
    },
    sliderLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#999'
    },
    inputGroup: {
      display: 'flex',
      gap: '12px'
    },
    numberInput: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #93c5fd',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none'
    },
    presetsCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    presetsLabel: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '16px'
    },
    presetsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px'
    },
    presetBtn: {
      padding: '12px 8px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.clouds, ...styles.cloud1}}></div>
      <div style={{...styles.clouds, ...styles.cloud2}}></div>
      <div style={{...styles.clouds, ...styles.cloud3}}></div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.h1}>SORDA-air</h1>
          <p style={styles.headerP}>Morphing Wing Control System</p>
        </div>

        <div style={styles.card}>
          <div style={styles.statusBar}>
            <div style={styles.statusInfo}>
              {connected ? (
                <>
                  <Wifi size={24} color="#22c55e" />
                  <span style={styles.statusConnected}>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={24} color="#ef4444" />
                  <span style={styles.statusDisconnected}>Disconnected</span>
                </>
              )}
            </div>
            <div style={styles.statusUrl}>
              {connected ? wsUrl : 'Not connected'}
            </div>
          </div>

          {!connected ? (
            <div style={styles.connectionSection}>
              <label style={styles.label}>WebSocket URL</label>
              <div style={styles.urlInputGroup}>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                  style={styles.urlInput}
                />
                <button onClick={connectWebSocket} style={{...styles.btn, ...styles.btnConnect}}>
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <button onClick={disconnect} style={{...styles.btn, ...styles.btnDisconnect}}>
              Disconnect
            </button>
          )}

          {feedback && (
            <div style={{...styles.feedback, ...(feedback.includes('Connected') || feedback.includes('set to') ? styles.feedbackSuccess : styles.feedbackInfo)}}>
              {feedback}
            </div>
          )}

          <div style={styles.angleDisplay}>
            <p style={{color: '#666', fontSize: '14px', fontWeight: 500, marginBottom: '8px'}}>Current Wing Angle</p>
            <p style={styles.angleValue}>{wingAngle.toFixed(1)}°</p>
          </div>

          <div style={styles.controlSection}>
            <div style={styles.sliderGroup}>
              <label style={styles.label}>Set Wing Angle (0° - 90°)</label>
              <input
                type="range"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => handleSliderChange(e.target.value)}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                disabled={!connected}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>0°</span>
                <span>45°</span>
                <span>90°</span>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <input
                type="number"
                min="0"
                max="90"
                value={inputAngle}
                onChange={(e) => setInputAngle(Math.min(90, Math.max(0, e.target.value)))}
                disabled={!connected}
                placeholder="Enter angle"
                style={styles.numberInput}
              />
              <button
                onClick={sendAngle}
                disabled={!connected}
                style={{...styles.btn, ...styles.btnSend}}
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>

        <div style={{...styles.card, ...styles.presetsCard}}>
          <p style={styles.presetsLabel}>Quick Presets</p>
          <div style={styles.presetsGrid}>
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
                style={{...styles.presetBtn, opacity: !connected ? 0.5 : 1}}
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