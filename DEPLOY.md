# DEPLOY: OPG Anđelić (statička stranica)

Obrazac je isti kao za `kliknik` i `candid`: **GitHub repo → GitHub Actions builda Docker image → GHCR → VPS povuče image**, a Caddy ga servira preko sslip.io. Ništa od ovoga nije napravljeno: repo, push i server rade se ručno.

Što je u repou: `Dockerfile` (nginx:alpine, kopira samo `site/`), `nginx.conf` (gzip, cache, noindex), `.dockerignore`, `docker-compose.yml`, `.github/workflows/build.yml`.

Adrese nakon deploya:
- https://opg-andjelic.31.97.183.143.sslip.io/tradicija/
- https://opg-andjelic.31.97.183.143.sslip.io/moderno/
- https://opg-andjelic.31.97.183.143.sslip.io/premium/

## 0. Lokalni test (opcionalno, na računalu s Dockerom)

```
docker build -t opg-andelic .
docker run --rm -p 8080:80 --name opg-test opg-andelic
# otvori http://localhost:8080/tradicija/ , /moderno/ , /premium/
docker stop opg-test
```

Provjera da u image nisu ušli ostali dokumenti (treba ispisati samo `index.html`, `tradicija`, `moderno`, `premium`, `zajednicko`):

```
docker run --rm opg-andelic ls /usr/share/nginx/html
```

## 1. GitHub repo

1. Napravi repo `opg-andelic` (privatni je u redu, GHCR image se vuče uz prijavu na VPS-u).
2. Pushaj sadržaj ove mape na granu `main`. `.gitignore` već izbacuje `.claude/`.
3. Prvi push pokreće workflow: build i push na `ghcr.io/<vlasnik>/opg-andelic:latest`. Deploy job će pasti dok se ne postave koraci 2 i 4, što je normalno.
4. [PROVJERITI] u `docker-compose.yml` zamijeni `sasasandzaktar` pravim vlasnikom repozitorija (mora biti malim slovima).

## 2. VPS: mapa i compose

```
mkdir -p ~/opg-andjelic && cd ~/opg-andjelic
# prekopiraj docker-compose.yml u ovu mapu
docker login ghcr.io          # ako je paket privatni (korisnik + PAT s read:packages)
docker compose pull
docker compose up -d
```

Servis `web` se zove `opg-andjelic-web`, sluša na portu 80 unutar mreže `iq_default` i ne objavljuje nijedan port prema van.

## 3. Caddy

U Caddyfile dodaj blok:

```
opg-andjelic.31.97.183.143.sslip.io {
    reverse_proxy opg-andjelic-web:80
}
```

Zatim reload Caddyja (kao kod ostalih stranica), npr. `docker exec <caddy-kontejner> caddy reload --config /etc/caddy/Caddyfile`.

## 4. Deploy ključ i GitHub secrets

1. Napravi novi SSH ključ samo za ovaj deploy (kao za kliknik).
2. U `authorized_keys` na VPS-u dodaj javni ključ s ograničenjem `command=`, tako da server uvijek izvrši samo pull + up za ovaj stack, npr.:
   `command="cd ~/opg-andjelic && docker compose pull && docker compose up -d",no-port-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAA... deploy-opg-andjelic`
3. U GitHub repou (Settings → Secrets and variables → Actions) dodaj:
   - `VPS_SSH_KEY` (privatni ključ)
   - `VPS_KNOWN_HOSTS` (izlaz `ssh-keyscan <VPS_HOST>`)
   - `VPS_USER`
   - `VPS_HOST`
4. Health check u workflowu gleda `https://opg-andjelic.31.97.183.143.sslip.io/tradicija/`. [PROVJERITI] želiš li drugu adresu.

## 5. noindex (demo)

`nginx.conf` već šalje `X-Robots-Tag: noindex, nofollow`, i `site/index.html` ima `robots` meta. Kad stranica postane prava, obriši retke s `X-Robots-Tag` u `nginx.conf` (4 mjesta) i `robots` meta u `site/index.html`.

## Napomene

- Izmjena stranice = izmijeni datoteke u `site/`, pushaj na `main`, workflow sve odradi.
- Telefonski broj za WhatsApp/Viber nalazi se na jednom mjestu: konstanta `KONTAKT` na vrhu `site/zajednicko/narudzba.js`.
- Slike su s Wikimedia Commons (popis i licence u `site/zajednicko/slike/IZVORI.md`). Za pravu stranicu zamijeniti klijentovim fotografijama.
- Open Graph slike su u `site/zajednicko/og/` (1200×630), a `og:image` koristi apsolutni URL na sslip.io adresi, pa će preview u Viberu/WhatsAppu raditi tek nakon deploya.
