import os
import sys
import platform
import subprocess
import tempfile
import threading
import socket
import time
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webview

# Vercel entrypoint compatibility
def app(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'PixelCraft Wallpaper Studio']

handler = app
application = app


# ── Find a free port ───────────────────────────────────────────────────────────
def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


# ── Silent HTTP server ─────────────────────────────────────────────────────────
class SilentHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


def start_server(dist_dir: Path, port: int):
    os.chdir(dist_dir)
    server = HTTPServer(('127.0.0.1', port), SilentHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    # Wait until server is truly accepting connections
    deadline = time.time() + 5.0
    while time.time() < deadline:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=0.5):
                break
        except OSError:
            time.sleep(0.05)

    print(f"[WLLPR] Server ready at http://127.0.0.1:{port}")
    return server


# ── pywebview API ─────────────────────────────────────────────────────────────
WALLHAVEN_API_KEY = "JF6rk4r6KRY7FVvOIpkgcSwhYkmyFByR"
WALLHAVEN_BASE_URL = "https://wallhaven.cc/api/v1"


class WallpaperApi:
    def save_wallpaper(self, bytes_data, filename):
        """Saves image bytes to the user's Downloads directory."""
        try:
            downloads_dir = Path.home() / "Downloads"
            downloads_dir.mkdir(parents=True, exist_ok=True)
            file_path = downloads_dir / filename
            with open(file_path, "wb") as f:
                f.write(bytes(bytes_data))
            print(f"[PixelCraft] Saved: {file_path}")
            return str(file_path)
        except Exception as e:
            print(f"[PixelCraft] Save error: {e}")
            raise RuntimeError(str(e))

    def set_wallpaper(self, bytes_data, filename):
        """Sets the OS desktop wallpaper from raw bytes."""
        try:
            tmp_dir = Path(tempfile.gettempdir()) / "pixelcraft"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            file_path = tmp_dir / filename
            with open(file_path, "wb") as f:
                f.write(bytes(bytes_data))
            return self._apply_system_wallpaper(file_path)
        except Exception as e:
            print(f"[PixelCraft] Wallpaper error: {e}")
            raise RuntimeError(str(e))

    def search_wallhaven(self, params=None):
        """Fetches wallpapers from the Wallhaven API."""
        import json
        import urllib.request
        import urllib.parse

        try:
            p = params if isinstance(params, dict) else {}
            query_dict = {
                "apikey": WALLHAVEN_API_KEY,
                "purity": p.get("purity", "100"),  # SFW by default
                "categories": p.get("categories", "110"),  # General + Anime
                "sorting": p.get("sorting", "toplist"),
                "order": p.get("order", "desc"),
                "page": str(p.get("page", 1)),
            }
            if p.get("q"):
                query_dict["q"] = p["q"]
            if p.get("resolutions"):
                query_dict["resolutions"] = p["resolutions"]
            if p.get("ratios"):
                query_dict["ratios"] = p["ratios"]
            if p.get("colors"):
                query_dict["colors"] = p["colors"]
            if p.get("topRange"):
                query_dict["topRange"] = p["topRange"]

            url = f"{WALLHAVEN_BASE_URL}/search?{urllib.parse.urlencode(query_dict)}"
            req = urllib.request.Request(url, headers={"User-Agent": "PixelCraft/1.0"})
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode("utf-8"))
                return data
        except Exception as e:
            print(f"[PixelCraft] Wallhaven search error: {e}")
            return {"data": [], "meta": {"current_page": 1, "last_page": 1, "total": 0}, "error": str(e)}

    def get_wallhaven_wallpaper(self, wallpaper_id):
        """Fetches detailed info for a single Wallhaven wallpaper."""
        import json
        import urllib.request
        import urllib.parse

        try:
            url = f"{WALLHAVEN_BASE_URL}/w/{wallpaper_id}?apikey={WALLHAVEN_API_KEY}"
            req = urllib.request.Request(url, headers={"User-Agent": "PixelCraft/1.0"})
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode("utf-8"))
                return data
        except Exception as e:
            print(f"[PixelCraft] Wallhaven details error: {e}")
            return {"error": str(e)}

    def set_wallpaper_from_url(self, image_url, filename="pixelcraft-online.jpg"):
        """Downloads a full-res wallpaper from a URL and sets it as the desktop background."""
        import urllib.request

        try:
            tmp_dir = Path(tempfile.gettempdir()) / "pixelcraft"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            file_path = tmp_dir / filename

            req = urllib.request.Request(image_url, headers={"User-Agent": "PixelCraft/1.0"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(file_path, "wb") as out_file:
                out_file.write(resp.read())

            return self._apply_system_wallpaper(file_path)
        except Exception as e:
            print(f"[PixelCraft] Set wallpaper from URL error: {e}")
            raise RuntimeError(str(e))

    def download_wallpaper_from_url(self, image_url, filename="pixelcraft-wallpaper.jpg"):
        """Downloads a full-res wallpaper from a URL into the user's Downloads directory."""
        import urllib.request

        try:
            downloads_dir = Path.home() / "Downloads"
            downloads_dir.mkdir(parents=True, exist_ok=True)
            file_path = downloads_dir / filename

            req = urllib.request.Request(image_url, headers={"User-Agent": "PixelCraft/1.0"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(file_path, "wb") as out_file:
                out_file.write(resp.read())

            print(f"[PixelCraft] Downloaded online wallpaper: {file_path}")
            return str(file_path)
        except Exception as e:
            print(f"[PixelCraft] Download wallpaper from URL error: {e}")
            raise RuntimeError(str(e))

    def _apply_system_wallpaper(self, file_path: Path):
        """Internal helper to set wallpaper across Windows, macOS, or Linux."""
        path_str = str(file_path.resolve())
        system = platform.system()
        if system == "Windows":
            import ctypes
            SPI_SETDESKWALLPAPER = 0x0014
            result = ctypes.windll.user32.SystemParametersInfoW(
                SPI_SETDESKWALLPAPER, 0, path_str, 0x01 | 0x02
            )
            if not result:
                raise RuntimeError("SystemParametersInfoW failed.")
        elif system == "Darwin":
            script = f'tell application "System Events" to tell every desktop to set picture to "{path_str}"'
            subprocess.run(["osascript", "-e", script])
        else:
            res = subprocess.run(["gsettings", "set", "org.gnome.desktop.background",
                                  "picture-uri", f"file://{path_str}"])
            if res.returncode != 0:
                subprocess.run(["feh", "--bg-fill", path_str])

        print(f"[PixelCraft] Wallpaper set: {path_str}")
        return path_str


def get_resource_path(relative_path: str) -> Path:
    """Get absolute path to resource, works for dev and for PyInstaller bundle."""
    if hasattr(sys, '_MEIPASS'):
        return Path(sys._MEIPASS) / relative_path
    return Path(__file__).resolve().parent / relative_path


# ── Entry point ────────────────────────────────────────────────────────────────
def main():
    dist_dir = get_resource_path("dist")
    if not (dist_dir / "index.html").exists():
        dist_dir = Path.cwd() / "dist"

    if not (dist_dir / "index.html").exists():
        print(f"[PixelCraft] ERROR: dist/index.html not found at {dist_dir}")
        sys.exit(1)

    port = find_free_port()
    start_server(dist_dir, port)

    api = WallpaperApi()
    url = f"http://127.0.0.1:{port}/index.html"
    print(f"[PixelCraft] Opening: {url}")

    window = webview.create_window(
        title="PixelCraft Wallpaper Studio",
        url=url,
        width=1280,
        height=850,
        resizable=True,
        js_api=api
    )

    webview.start()


if __name__ == "__main__":
    main()
