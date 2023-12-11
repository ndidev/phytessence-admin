import { customAlphabet } from "nanoid/non-secure";

const numbers = "1234567890";
const lowercase = "abcdefghijklmnopqrstuvwxyz";
const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const alphabet = [numbers, lowercase, uppercase].join("");
const length = 10;

const nanoid = customAlphabet(alphabet, length);

export { nanoid };
