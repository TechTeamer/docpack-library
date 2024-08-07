import * as console from "node:console";
import {generateTable} from "./table.formatter.js";

const table = `| Yeet |    the     |         now |
|-----------|:-----------:|------------:|
| Chat gpt  | define fun, ez egy nagyon hosszú szöveg lesz amit majd tördelni kell  | pop the baby |`

const rez = generateTable(table);

console.log(rez);

