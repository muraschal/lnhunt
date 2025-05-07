# CI/CD-Pipeline: GitHub + Vercel + Cursor

Diese Dokumentation beschreibt den vollständigen Workflow für die Entwicklung und Bereitstellung des LNHunt-Projekts.

## Branching-Strategie
- **main**: Produktionscode (automatisches Deployment auf lnhunt.rapold.io)
- **feature/\***: Feature-Branches (automatisches Preview-Deployment auf pr-[nummer].lnhunt.rapold.io)

## Workflow-Schritte

### 1. Entwicklung in Cursor
```bash
# Neuen Feature-Branch erstellen
git checkout -b feature/neue-funktion
   
# Entwickeln und testen
npm run dev  # Lokaler Dev-Server auf http://localhost:3000
   
# Änderungen committen
git add .
git commit -m "Feat: Beschreibung der Änderung"
   
# Branch pushen
git push -u origin feature/neue-funktion
```

### 2. Pull Request & CI
- PR auf GitHub von `feature/*` zu `main` erstellen
- Vercel erstellt automatisch Preview-Deployment auf `pr-[nummer].lnhunt.rapold.io`
- PR durchläuft automatische Tests (falls konfiguriert)

### 3. Review & Merge
- Code-Review in GitHub durchführen
- Nach Approval: PR mergen (Squash & Merge empfohlen)
- Branch nach Merge löschen

### 4. Deployment
- Vercel deployed automatisch auf Produktion (lnhunt.rapold.io)
- Monitoring der Deployment-Logs in Vercel Dashboard

## Umgebungen

1. **Production** (https://lnhunt.rapold.io)
   - Branch: `main`
   - Automatisches Deployment nach Merge
   - Live-Umgebung mit realen Daten

2. **Preview** (https://pr-xxx.lnhunt.rapold.io)
   - Branches: Alle außer `main`
   - Automatisches Deployment für jeden PR
   - Isolierte Testumgebung

3. **Development** (http://localhost:3000)
   - Lokale Entwicklung mit `npm run dev`
   - Mock-Daten und -Services

## Domain-Konfiguration
- **Produktion**: lnhunt.rapold.io → main-Branch
- **Preview**: *.lnhunt.rapold.io → CNAME zu cname.vercel-dns.com
- **Preview-URL-Schema**: pr-[nummer].lnhunt.rapold.io für jeden PR

### Cloudflare-Einrichtung
1. Wildcard-CNAME-Eintrag erstellen:
   - Name: `*.lnhunt.rapold.io`
   - Target: `cname.vercel-dns.com`
   - Proxy-Status: Proxied

### Vercel-Einrichtung
1. Wildcard-Domain hinzufügen: `*.lnhunt.rapold.io`
2. Mit Preview-Umgebung verknüpfen
3. "All Branches" auswählen

## Umgebungsvariablen
- In Vercel getrennt für Production und Preview konfigurieren
- Development-Variablen in `.env.local` (nicht committen!)
- Sensitive Daten nur in Vercel speichern, nie im Repository

### Entwicklungsspezifische Variablen
```
# .env.local (lokal, nicht committen)
NODE_ENV=development
# Weitere Entwicklungsvariablen...
```

## Häufige Befehle
```bash
# Lokale Entwicklung
npm run dev

# Typprüfung
npm run type-check  # Falls TypeScript verwendet wird

# Tests (falls konfiguriert)
npm test

# Build testen
npm run build
```

## Wichtige Hinweise

- **NIEMALS** direkt auf `main` committen - immer über PRs
- Vercel-Deployments sind mit GitHub-Status verknüpft
- PRs können erst gemerged werden, wenn Vercel-Deployment erfolgreich ist
- Umgebungsvariablen sind in Vercel pro Umgebung konfiguriert

## Fehlerbehebung

- **Deployment fehlgeschlagen?** Prüfe die Vercel-Logs im Dashboard
- **Lokale Entwicklung funktioniert, Preview nicht?** Prüfe Umgebungsvariablen
- **Reset nötig?** PR schließen und neu öffnen für neues Deployment

## Branch-Schutzregeln (GitHub)

Für die Sicherheit des `main`-Branches:
- Erfordere Pull Request vor dem Merge
- Erfordere mindestens 1 Review
- Statusprüfungen müssen bestanden sein (Vercel-Deployment)
- Branch ist gegen Force-Push geschützt

---

Dokumentation erstellt am: 29.03.2024  
Zuletzt aktualisiert: 29.03.2024 