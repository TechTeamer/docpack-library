import { renderMermaid, run } from "@mermaid-js/mermaid-cli"
import puppeteer from 'puppeteer'
import {writeFileSync} from "node:fs";

let browser = await puppeteer.launch();

const input = `flowchart TD
    subgraph FaceKom [FaceKom]
        Szoba
        Archivált
        Lezárt
    end

    subgraph Partner [Partner]
        Backup
        Szalag
    end

    Szoba -->|Mentés készítés| Backup
    Backup -->|Mentés visszatöltés| Szoba
    Szoba -->|Videóhívás vége| Lezárt
    Lezárt -->|Archiválás| Archivált
    Archivált -->|Archiválás visszaállítás| Lezárt
    Archivált -->|Szalagra írás| Szalag
    Szalag -->|Szalagról visszaállítás| Archivált
`


const a = await renderMermaid(browser, input, "png")

writeFileSync("images/asd.png", a.data)

await browser.close()

console.log("Done")

// await run("asd.md", "asd.svg", {
//   outputFormat: "svg",
// })
