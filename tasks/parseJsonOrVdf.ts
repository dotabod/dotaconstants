import vdfparser from "vdf-parser";

export function parseJsonOrVdf(text: string, url: string) {
  try {
    return JSON.parse(text);
  } catch (err) {
    try {
      let fixed = text
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");
      // Remove empty values that break parser
      fixed = fixed.replace(/\t\t"ItemRequirements"\r\n\t\t""/g, "");
      fixed = fixed.replace(/\t\t\t"has_flying_movement"\t\r\n\t\t\t""/g, "");
      fixed = fixed.replace(/\t\t\t"damage_reduction"\t\r\n\t\t\t""/g, "");
      // Remove property names followed by empty string values (handles any indentation)
      fixed = fixed.replace(/(\t+)"[^"]*"\r?\n\1""\r?\n/g, "");
      // Clean up any remaining empty lines that might cause issues
      fixed = fixed.replace(/^\s*\r?\n/gm, "");
      const vdf = vdfparser.parse(fixed, { types: false, arrayify: true });
      return vdf;
    } catch (e) {
      console.error("Couldn't parse JSON or VDF", url);
      throw e;
    }
  }
}
