import { customAlphabet } from "nanoid";

const ID_LENGTH = 12;
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export const generateId = customAlphabet(ALPHABET, ID_LENGTH);
