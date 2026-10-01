# OPG Anđelić: pokazne web stranice

Tri prijedloga web stranice za OPG Anđelić (Opuzen, neretvanske mandarine).

- `site/tradicija/`, `site/moderno/`, `site/premium/`: prijedlozi
- `site/zajednicko/`: zajedničke slike, galerija i forma za narudžbu (WhatsApp/Viber)

Čisti HTML/CSS/JS. Lokalno: `npx serve site`.

Deploy: push na `main` → GitHub Actions builda nginx image → GHCR → VPS povuče image (vidi `DEPLOY.md`).
