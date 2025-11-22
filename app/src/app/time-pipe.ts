import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  pure: false,
})
export class TimePipe implements PipeTransform {
  transform(timerData: { hh: number; mm: number; ss: number }): string {
    const hours = timerData.hh.toString().padStart(2, '0');
    const minutes = timerData.mm.toString().padStart(2, '0');
    const seconds = timerData.ss.toString().padStart(2, '0');

    // console.log(hours + minutes + seconds);
    return `${hours}:${minutes}:${seconds}`;
  }
}
