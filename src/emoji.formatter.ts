import emojiRegex from "emoji-regex";
// If something is not showing up, check the https://github.com/stone-zeng/latex-emoji repo!
import emojis from "./data/emoji.json" with { type: "json" };

interface EmojiStruct {
  emoji: string;
  description: string;
  category: string;
  aliases: string[];
  tags: string[];
  unicode_version: string;
  ios_version: string
}

const allEmojis = emojis as EmojiStruct[];

function find(str: string): string {
  return allEmojis.find(emoji => emoji.emoji === str)?.aliases.at(0) ?? "";
}

export function formatEmojis(str: string): string {
  const regex = emojiRegex()
  let res = str;
  for (const match of str.matchAll(regex)) {
    const e = match[0]
    res = res.replaceAll(e, `\\emoji{${find(e)}}`)
  }
  return res.replaceAll("_", "-");
}

export function cleanEmojis(str: string): string {
  const regex = emojiRegex()
  let res = str;
  for (const match of str.matchAll(regex)) {
    const e = match[0]
    const z = find(e)
    res = res.replaceAll(e, "")
  }
  return res.replace(/\s{2,}/g, " ");
}
