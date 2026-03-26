#!/usr/bin/env python3
"""
Simple HTTP server for MC Texture Converter
Usage:
    python server.py          # port 8000 (default)
    python server.py 8080     # custom port
"""

import http.server
import socketserver
import sys
import os
import webbrowser
from threading import Timer

# ── Config ────────────────────────────────────────────────────────────────────
PORT    = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
HOST    = "localhost"
HTML    = "index.html"

# Change working directory to the folder this script lives in
os.chdir(os.path.dirname(os.path.abspath(__file__)))


# ── Handler ───────────────────────────────────────────────────────────────────
class Handler(http.server.SimpleHTTPRequestHandler):

    def log_message(self, fmt, *args):
        # Cleaner console output
        print(f"  {self.address_string()}  {fmt % args}")

    def end_headers(self):
        # Allow cross-origin requests (needed for images/template.png)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()


# ── Auto-open browser ─────────────────────────────────────────────────────────
def open_browser():
    url = f"http://{HOST}:{PORT}/{HTML}"
    print(f"\n  ブラウザで開きます: {url}\n")
    webbrowser.open(url)


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        httpd.allow_reuse_address = True

        url = f"http://{HOST}:{PORT}/{HTML}"
        print("=" * 58)
        print("  MC Texture Converter — ローカルサーバー")
        print("=" * 58)
        print(f"  アドレス : {url}")
        print(f"  停止     : Ctrl + C")
        print("=" * 58)

        # Open browser after a short delay (gives server time to bind)
        Timer(0.8, open_browser).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n  サーバーを停止しました。\n")


if __name__ == "__main__":
    main()