import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  pure: false,
})
export class TimePipe implements PipeTransform {
  transform(timerData: { ss: number }): string {
    const seconds = timerData.ss % 60;
    let minutes = Math.floor(timerData.ss / 60);
    let hours = 0;
    if (minutes >= 60) {
      hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
    }

    // console.log('Stunden' + hours);
    // console.log('Minuten' + minutes);
    // console.log('Sekunden' + seconds);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
