# noted

`noted` is a lightweight, mobile-optimized note editor designed to bridge the gap between your local file system and your mobile devices. It runs as a local web server that provides a Progressive Web Application (PWA) interface, enabling you to edit your notes from anywhere with real-time synchronization and full offline support.

## 🚀 Key Features

- **CLI-Driven:** Launch the editor for any directory instantly.
- **PWA & Offline-First:** Installable on Android/iOS/Desktop. Work completely offline with automatic background sync when you reconnect.
- **Real-time Sync:** Powered by WebSockets (Socket.io) and server-side file watching (Chokidar).
- **Conflict Resolution:** Built-in line-level diff viewer to resolve concurrent edits safely.
- **Security:** Optional JWT-based password protection for private access.
- **Modern UI:** Clean Material Design 3 interface built with MDUI v2 and an AMOLED dark theme.
- **Integrated Editor:** Simple and fast native textarea editor.

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/noted.git
   cd noted
   ```

2. **Install dependencies:**
   ```bash
   # Install root and workspace dependencies
   npm install
   ```

3. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

## 📖 Usage

Start the server from the root directory:

```bash
# Start serving the current directory on default port 6767
npm start

# Or serve a specific directory
npm start -- /path/to/your/notes
```

### CLI Options

| Option | Description | Default |
| --- | --- | --- |
| `[path]` | Path to the notes directory | `.` |
| `-p, --port <number>` | Port to use | `6767` |
| `-c, --config <path>` | Path to `.env` config file | `config.env` |
| `-r, --readonly` | Run in read-only mode | `false` |
| `--increment-port` | Auto-increment port if in use | `false` |

## ⚙️ Configuration

Create a `config.env` file in your notes directory or the root directory to customize settings:

```env
PORT=6767
PASSWORD=your-secret-password
READ_ONLY=false
INCREMENT_PORT=true
```

## 🏗️ Technical Architecture

- **Backend:** Node.js, Koa.js, Socket.io, Chokidar.
- **Frontend:** Vue.js 3, Pinia, MDUI v2.
- **Persistence:** Dexie.js (IndexedDB) for offline caching and change queuing.
- **PWA:** `vite-plugin-pwa` for service worker management and asset caching.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
