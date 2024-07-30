import * as emoji from 'node-emoji'
import emojiRegex from "emoji-regex";

const asd = "asdasd 😅 qweqwe"

const regex = emojiRegex()

for (const match of asd.matchAll(regex)) {
  const e = match[0]
  const z = emoji.find(e)
  console.log(z.key)
}
