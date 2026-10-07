# LabelTD in the browser

This project runs the original LabelTD Visual Basic 6 game source in a browser. The web app parses `legacy/spel.frm` at startup, executes its procedures in a small VB6 interpreter, and renders the resulting VB controls with Three.js. Movement, towers, waves, money, and combat come from the interpreted source; the Three.js host only draws controls and forwards input.

The game opens straight on Map 1 at the original Average difficulty (10 lives). The launch and in-game menus are omitted, as is the map editor.

## Run

```sh
cd web
npm install
npm run dev
```

Open the local URL printed by Vite. Use **NEXT LVL!** to start a wave, click a tower icon to build, move over the board, and click the tower to place it. To choose a different tower while one is following the pointer, press **C** to cancel it, then click another icon. These are the original VB6 handlers; the source's upgrade and sell actions are also handled by the interpreter.

The Fire Tower icon is visible from the start but locked by the original source. At level 5, click the motherboard, buy the P35 upgrade for 50 gold, then select Fire Tower (40 gold).

`npm test` checks source parsing, startup file I/O, source-controlled tower costs, difficulty and wave events, and timed movement. `npm run build` checks TypeScript and creates the static site in `web/dist`.

## GitHub Pages

The `main` branch deploys through [the Pages workflow](.github/workflows/pages.yml). In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The site URL is `https://mintl.github.io/labeltd-remake/`.

To check the Pages build locally:

```sh
cd web
npm ci
npm test
npm run build:pages
npm run preview:pages
```

Open `http://127.0.0.1:4173/labeltd-remake/`. The Pages build uses the repository path for both Vite assets and the original VB6 files. Ordinary `npm run dev` still serves the game at `/`.

## Project layout

| Path | Purpose |
| --- | --- |
| `legacy/` | Unmodified VB6 project, forms, resources, and text data. |
| `web/scripts/sync-legacy.mjs` | Copies the required original files into Vite's public directory before dev, test, and build. |
| `web/src/vb/formParser.ts`, `codeParser.ts`, `ast.ts` | Parse the VB6 form designer and executable procedures into an AST. |
| `web/src/vb/vm.ts`, `values.ts`, `controls.ts` | Execute the source with VB6 values, control arrays, events, and timers. |
| `web/src/vb/projectLoader.ts`, `frx.ts`, `virtualFs.ts` | Load the original project, `.frx` pictures, and VB file I/O data. |
| `web/src/host/threeHost.ts` | Paint interpreted VB controls through Three.js and relay browser input. |
| `web/src/main.ts` | Wire the interpreter to the host and start Map 1 directly. |

The web runtime fetches original `.vbp`, `.frm`, `.frx`, and map files, then parses them in the browser. After editing a file under `legacy/`, restart `npm run dev` to sync it into `web/public/legacy`. The interpreter implements the VB6 features used by this game's main form; it is not a general-purpose VB6 or ActiveX runtime. The separate map editor project is outside this version.
