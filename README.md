# Biobased Beslisboom Webtool

Een interactieve beslisboom webtool die VvE's (Verenigingen van Eigenaren) helpt bij het maken van geïnformeerde keuzes over isolatie en verduurzamingsmaatregelen. Deze YAML-gedreven webapplicatie begeleidt gebruikers door een gestructureerde beslissingsboom om de meest geschikte biobased en conventionele isolatieoplossingen voor hun gebouwen te vinden.

## 👥 Credits

Deze applicatie is ontwikkeld door **Renzo Westerbeek** op basis van de Beslisboom van **Laurijn Roggeveen** voor Creative City Solutions.

## 🌐 Relatie met Creative City Solutions

Deze tool maakt onderdeel uit van de [verduurzamingsdiensten van Creative City Solutions](https://www.creativecitysolutions.com/verduurzamen). Op de website staat:

> "Met onze intuïtieve configurator vergelijk je eenvoudig scenario's, kosten en baten – en zie je direct wat verduurzaming oplevert."

Deze webapplicatie fungeert als die interactieve configurator en helpt VvE-leden isolatie-opties te verkennen en de afwegingen tussen verschillende oplossingen te begrijpen. De tool richt zich specifiek op het begeleiden van beslissingen rond gevelisolatie en vergelijkt conventionele materialen (zoals minerale wol) met biobased alternatieven (zoals houtvezel isolatie).

De applicatie integreert met het bredere aanbod van Creative City Solutions: volledig gesubsidieerde procesbegeleiding voor VvE-verduurzamingsprojecten, waarbij huiseigenaren worden geholpen bij complexe beslissingen over energie-efficiëntieverbeteringen.

## ✨ Functionaliteiten

- **Interactieve Beslisboom**: Stap-voor-stap begeleiding door isolatiekeuze-scenario's
- **YAML-gedreven Configuratie**: Eenvoudig te updaten en onderhouden beslissingsbomen zonder code-aanpassingen
- **Biobased Alternatieven**: Benadrukt milieuvriendelijke isolatie-opties
- **Vergelijkingskaarten**: Visuele vergelijking van voor- en nadelen en kosten per optie
- **Interactieve Tooltips**: Hover-verklaringen voor technische termen
- **Deel-functionaliteit**: Deel resultaten met andere besluitvormers
- **Voortgangsindicatie**: Visuele voortgangsindicator door de beslissingsboom
- **Responsive Design**: Werkt naadloos op desktop en mobiele apparaten

## 🛠️ Tech Stack

- **React 18** met TypeScript
- **Vite** voor snelle ontwikkeling en building
- **js-yaml** voor het parsen van YAML flow-definities
- Moderne CSS met inline styles voor component styling

## 📋 Vereisten

- **Node.js 20.x** (vereist - gespecificeerd in `package.json` engines)

## 🚀 Quick Start

### Installatie

```bash
npm install
```

### Ontwikkeling

Start de ontwikkelserver:

```bash
npm run dev
```

De applicatie is beschikbaar op `http://localhost:5173`.

### Productie Build

```bash
npm run build
```

De productie build wordt gegenereerd in de `dist/` directory.

### Preview Productie Build

```bash
npm run preview
```

## 📁 Projectstructuur

```
├── public/
│   └── flow.yaml          # YAML definitie van de beslissingsboom
├── src/
│   ├── main.tsx          # Applicatie entry point
│   ├── types.ts          # TypeScript type definities
│   ├── utils/
│   │   └── yamlLoader.ts # YAML loading utility
│   ├── view/
│   │   └── App.tsx       # Hoofdapplicatie component
│   └── widgets/
│       └── DecisionFlow.tsx # Interactieve beslissingsboom component
├── dist/                 # Productie build output
├── index.html         # HTML template
├── vite.config.ts      # Vite configuratie
└── tsconfig.json       # TypeScript configuratie
```

## 📝 YAML Flow Schema

De beslissingsboom wordt gedefinieerd in `public/flow.yaml`. Het schema is:

```yaml
title: string (optioneel)              # Flow titel
description: string (optioneel)        # Flow beschrijving
startId: string                       # ID van het startnode
tooltips:                             # Optionele tooltip definities
  - term: string
    explanation: string
nodes:
  - id: string                        # Unieke node identifier
    title: string (optioneel)          # Node titel
    question: string                  # Vraagtekst
    note: string (optioneel)           # Aanvullende note/context
    options:
      - label: string                 # Optie label
        nextId: string (optioneel)     # Volgende node ID (bij doorgang)
        result: string (optioneel)     # Eindresultaat tekst (bij afsluiting)
        card:                         # Optionele vergelijkingskaart
          price: string (optioneel)
          pros: string[] (optioneel)
          cons: string[] (optioneel)
          description: string (optioneel)
          biobasedAlternativeIndex: number (optioneel)
```

### Flow Controle

- **`result`**: Beëindigt de flow en toont het finale advies/uitkomst
- **`nextId`**: Navigeert naar de volgende node in de flow
- **`card`**: Toont een vergelijkingskaart met gedetailleerde informatie over de optie

### Voorbeeld Node

```yaml
- id: isolatie-optie
  title: Isolatie Keuze
  question: Welke isolatiemethode overweegt u?
  note: "Een goede isolatie vermindert energiekosten aanzienlijk"
  options:
    - label: Spouwmuurisolatie
      nextId: spouw-opties
    - label: Buitengevelisolatie
      result: |
        Buitengevelisolatie is een uitstekende keuze voor...
      card:
        price: "€50-80/m²"
        pros:
          - Zeer hoge isolatiewaarde
          - Geen ruimteverlies
        cons:
          - Duurder dan spouwisolatie
          - Vergt planning
```

## 🎨 Aanpassen

### Flow Updaten

Bewerk simpelweg `public/flow.yaml` om de beslissingsboom aan te passen. De applicatie herlaadt automatisch tijdens ontwikkeling.

### Styling

De applicatie gebruikt inline styles in React componenten. Het hoofd kleurenschema is:
- Primary: `#04452e` (donkergroen)
- Secondary: `#daf7e0` (lichtgroen)
- Accent: `#fdd835` (geel voor biobased alternatieven)

Om kleuren aan te passen, bewerk de style objecten in `src/widgets/DecisionFlow.tsx`.

## 📦 Deployment

Dit project kan worden gedeployed naar elke statische hosting service. Voor AWS Amplify deployment, zie `DEPLOYMENT.md` voor specifieke configuratie.

## 🤝 Bijdragen

1. Zorg dat je Node.js 20.x gebruikt
2. Installeer dependencies: `npm install`
3. Maak je wijzigingen
4. Test lokaal: `npm run dev`
5. Build om te verifiëren: `npm run build`

## 📄 Licentie

Dit project is privé en eigendom van Creative City Solutions.

## 🔗 Links

- [Creative City Solutions - Verduurzamen](https://www.creativecitysolutions.com/verduurzamen)
- [Creative City Solutions - Contact](https://www.creativecitysolutions.com/afspraak)

## 📧 Contact

Voor vragen over deze tool of de diensten van Creative City Solutions:
- Website: [creativecitysolutions.com](https://www.creativecitysolutions.com)
- Email: contact@creativecitysolutions.com
- Telefoon: +31 (0)20 226 21 66
