import { createContext } from "@praha/diva";

export const [getFetch, withFetch] = createContext<typeof fetch>();

export const withTursoFetch = withFetch(() => globalThis.fetch);
