# Biobased Beslisboom Webtool

Eenvoudige webtool die een YAML-gedreven beslisboom interactief maakt.

## Vereisten

- Node.js 20.x (vereist in dit project)

## Installatie

```bash
npm install
```

## Ontwikkelserver starten

```bash
npm run dev
```

Open vervolgens `http://localhost:5173`.

## YAML aanpassen

De flow wordt geladen vanaf `public/flow.yaml`. Lever later jullie YAML aan en vervang dit bestand. Het schema is:

```yaml
startId: string
nodes:
  - id: string
    title: string (optioneel)
    question: string
    options:
      - label: string
        nextId: string (optioneel)
        result: string (optioneel)
```

- `result` beëindigt de flow met een advies/uitkomst.
- `nextId` gaat naar de volgende node.

## Builden

```bash
npm run build
npm run preview
```
