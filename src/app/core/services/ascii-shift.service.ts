import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AsciiShiftService {
  transform(value: string): string {
    if (!value) {
      return "";
    }

    let result = "";
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const ascii = char.charCodeAt(0);

      let newChar: string;
      if (ascii < 128) {
        newChar = String.fromCharCode(ascii + 128);
      } else {
        newChar = String.fromCharCode(ascii - 128);
      }

      result += newChar;
    }

    return result;
  }
}
