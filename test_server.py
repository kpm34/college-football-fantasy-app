import http.server
import socketserver
import os

PORT = 9999

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"Request: {self.path}")
        
        if self.path == '/':
            self.path = '/frontend/index.html'
        elif self.path == '/chrome-football-viewer.html':
            self.path = '/frontend/chrome-football-viewer.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), TestHandler) as httpd:
        print(f"🚀 Test Server on port {PORT}")
        print(f"🔧 Chrome Football Viewer: http://localhost:{PORT}/chrome-football-viewer.html")
        print("Press Ctrl+C to stop")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Stopped")
            httpd.shutdown() 