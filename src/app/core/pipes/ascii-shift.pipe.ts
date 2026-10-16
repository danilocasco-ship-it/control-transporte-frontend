import { Pipe, PipeTransform } from "@angular/core";
import { AsciiShiftService } from "../services/ascii-shift.service";

@Pipe({
  name: "asciiShift",
  standalone: true,
})
export class AsciiShiftPipe implements PipeTransform {
  constructor(private asciiShiftService: AsciiShiftService) {}
  transform(value: string): string {
    return this.asciiShiftService.transform(value);
  }
}
