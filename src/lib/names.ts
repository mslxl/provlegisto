import { capitalize, random } from "lodash/fp"

export default function generateRandomName(suffix?: string){
    const adj = random(0, adjectives.length)
    const n = random(0, nouns.length)
    return capitalize(`${adjectives[adj]} ${nouns[n]}${suffix}`.trim())
}


// Cop from https://github.com/zellij-org/zellij/blob/65a7fcf426e6131fe68b300fb746271419a08865/src/sessions.rs#L426-L560
// Thanks for the organization's fantastic work
const adjectives = [
  "adamant",
  "adept",
  "adventurous",
  "arcadian",
  "auspicious",
  "awesome",
  "blossoming",
  "brave",
  "charming",
  "chatty",
  "circular",
  "considerate",
  "cubic",
  "curious",
  "delighted",
  "didactic",
  "diligent",
  "effulgent",
  "erudite",
  "excellent",
  "exquisite",
  "fabulous",
  "fascinating",
  "friendly",
  "glowing",
  "gracious",
  "gregarious",
  "hopeful",
  "implacable",
  "inventive",
  "joyous",
  "judicious",
  "jumping",
  "kind",
  "likable",
  "loyal",
  "lucky",
  "marvellous",
  "mellifluous",
  "nautical",
  "oblong",
  "outstanding",
  "polished",
  "polite",
  "profound",
  "quadratic",
  "quiet",
  "rectangular",
  "remarkable",
  "rusty",
  "sensible",
  "sincere",
  "sparkling",
  "splendid",
  "stellar",
  "tenacious",
  "tremendous",
  "triangular",
  "undulating",
  "unflappable",
  "unique",
  "verdant",
  "vitreous",
  "wise",
  "zippy",
]

const nouns = [
  "aardvark",
  "accordion",
  "apple",
  "apricot",
  "bee",
  "brachiosaur",
  "cactus",
  "capsicum",
  "clarinet",
  "cowbell",
  "crab",
  "cuckoo",
  "cymbal",
  "diplodocus",
  "donkey",
  "drum",
  "duck",
  "echidna",
  "elephant",
  "foxglove",
  "galaxy",
  "glockenspiel",
  "goose",
  "hill",
  "horse",
  "iguanadon",
  "jellyfish",
  "kangaroo",
  "lake",
  "lemon",
  "lemur",
  "magpie",
  "megalodon",
  "mountain",
  "mouse",
  "muskrat",
  "newt",
  "oboe",
  "ocelot",
  "orange",
  "panda",
  "peach",
  "pepper",
  "petunia",
  "pheasant",
  "piano",
  "pigeon",
  "platypus",
  "quasar",
  "rhinoceros",
  "river",
  "rustacean",
  "salamander",
  "sitar",
  "stegosaurus",
  "tambourine",
  "tiger",
  "tomato",
  "triceratops",
  "ukulele",
  "viola",
  "weasel",
  "xylophone",
  "yak",
  "zebra",
]
