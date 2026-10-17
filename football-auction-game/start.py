#!/usr/bin/env python3
import os
import sys
import socket
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 3000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def log_message(self, format, *args):
        # Keep terminal clean, only log significant requests
        pass

def main():
    local_ip = get_local_ip()
    port = PORT
    server = None
    for p in [3000, 8080, 5000, 8000]:
        try:
            server = HTTPServer(('0.0.0.0', p), CustomHandler)
            port = p
            break
        except OSError:
            continue

    if not server:
        print("❌ Error: Could not bind to ports 3000, 8080, 5000, or 8000.")
        sys.exit(1)

    url = f"http://localhost:{port}"
    lan_url = f"http://{local_ip}:{port}"

    print("\n" + "=" * 60)
    print("  ⚽  FOOTBALL AUCTION GAME IS LIVE!")
    print("=" * 60)
    print(f"  👉 Play on this Mac:    {url}")
    print(f"  📱 Share with friends:  {lan_url}  (same Wi-Fi)")
    print("=" * 60)
    print("  Opening browser automatically... Press Ctrl+C to stop.\n")

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Stopping Football Auction Game. See you next transfer window! ⚽\n")
        server.server_close()

if __name__ == '__main__':
    main()
