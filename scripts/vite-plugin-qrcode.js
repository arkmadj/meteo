import qrcode from 'qrcode-terminal';
import { networkInterfaces } from 'os';

/**
 * Get the local network IP address
 */
function getLocalNetworkIP() {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
}

/**
 * Vite plugin to display QR code for mobile access
 */
export default function vitePluginQRCode() {
  let config;
  
  return {
    name: 'vite-plugin-qrcode',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          const protocol = config.server.https ? 'https' : 'http';
          const port = config.server.port || 3000;
          const localIP = getLocalNetworkIP();
          const networkUrl = `${protocol}://${localIP}:${port}`;
          const localUrl = `${protocol}://localhost:${port}`;
          
          console.log('\n');
          console.log('  \x1b[1m\x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   ' + localUrl);
          console.log('  \x1b[1m\x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m ' + networkUrl);
          console.log('\n  \x1b[1m\x1b[36mScan QR code to open on mobile:\x1b[0m\n');
          
          // Generate QR code with small size to fit in terminal
          qrcode.generate(networkUrl, { small: true }, (qrcode) => {
            console.log(qrcode);
          });
          
          console.log('\n  \x1b[2mTip: Make sure your mobile device is on the same network\x1b[0m\n');
        }, 100);
      });
    },
  };
}
