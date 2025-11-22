import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  pure: false,
})
export class TimePipe implements PipeTransform {
  transform(timerData: { hh: number; mm: number; ss: number }): string {
    const hours =
      timerData.hh.toString().length === 1 ? '0' + timerData.hh : timerData.hh.toString();
    const minutes =
      timerData.mm.toString().length === 1 ? '0' + timerData.mm : timerData.mm.toString();
    const seconds =
      timerData.ss.toString().length === 1 ? '0' + timerData.ss : timerData.ss.toString();
    // console.log(hours + minutes + seconds);
    return `${hours}:${minutes}:${seconds}`;
  }
}
