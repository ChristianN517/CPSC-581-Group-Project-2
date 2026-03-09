Developer HTTPS (mkcert + Caddy) — Run app on local IP with microphone access

Goal
- Run the Next.js frontend on https://192.168.56.1:3000 and the socket server reachable from the same host using TLS so `getUserMedia()` is allowed by Chrome on the remote machine.

Overview (chosen approach)
- Use `mkcert` to create locally-trusted certificates for your IP and `localhost`.
- Use Caddy as a simple TLS reverse proxy that presents the mkcert certs to browsers and proxies requests to your local Next dev server (port 3000) and socket server (port 3001).

Steps
1) Install mkcert and Caddy
- mkcert: https://github.com/FiloSottile/mkcert#installation
- Caddy: https://caddyserver.com/docs/install

2) Trust mkcert CA and create cert for your IP
- Run (replace the IP with your machine IP):

  mkcert -install
  mkcert 192.168.56.1 localhost

- This creates files like `192.168.56.1+localhost.pem` and `192.168.56.1+localhost-key.pem` in the current folder.

3) Create a Caddyfile (example) — place next to the generated certs

```
# Caddyfile

192.168.56.1:443 {
  tls /full/path/to/192.168.56.1+localhost.pem /full/path/to/192.168.56.1+localhost-key.pem

  # Proxy frontend (Next dev) — port 3000
  reverse_proxy 127.0.0.1:3000
}

# Socket server TLS endpoint (so client can connect to https://192.168.56.1:3001)
192.168.56.1:3001 {
  tls /full/path/to/192.168.56.1+localhost.pem /full/path/to/192.168.56.1+localhost-key.pem
  reverse_proxy 127.0.0.1:3001
}
```

Notes:
- Using two server blocks lets you expose both `https://192.168.56.1` (frontend) and `https://192.168.56.1:3001` (socket) with TLS using the same certificate.
- `reverse_proxy` forwards incoming requests to the actual local service on the specified port.

4) Run Caddy
- Start Caddy pointing to that Caddyfile (from the folder where the certs are or use absolute paths in Caddyfile):

  caddy run --config /full/path/to/Caddyfile

5) Start your services
- Start socket server (server/index.js) — it can stay as plain HTTP on port 3001 (Caddy will terminate TLS and proxy):

  node server/index.js

- Start Next.js dev server normally (npm run dev in `my-app`).

6) Access from other machine
- On the remote browser (other computer on the LAN) open:

  https://192.168.56.1:3000

- Chrome should trust the mkcert cert (you installed mkcert CA earlier on this machine). If not, repeat `mkcert -install` on that machine or copy the CA cert into its trust store.

7) Socket client
- The client now builds the socket URL automatically from the page URL (same host, port 3001).
- If you prefer, set `NEXT_PUBLIC_SOCKET_URL` in the environment to `https://192.168.56.1:3001` for explicit control.

Troubleshooting
- `navigator.mediaDevices.getUserMedia` still blocked: check the site shows HTTPS and the certificate is trusted (lock icon). If certificate not trusted on the other machine, install the mkcert CA there too.
- CORS / socket connection issues: ensure `server/index.js` is reachable from the other machine (no firewall blocking 3001). Caddy will proxy TLS to local 3001.

Security notes
- mkcert + Caddy for local dev is safe for testing but do not use these certificates in production. mkcert creates CA certs that must be carefully handled.

If you want, I can:
- Add a small `scripts/` helper to start Caddy with the Caddyfile placed in the repo, and/or
- Update `server/index.js` to optionally serve HTTPS directly using cert/key files (less flexible than Caddy). Let me know which you'd prefer.
