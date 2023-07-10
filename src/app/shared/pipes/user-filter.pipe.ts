import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userFilter',
})
export class UserFilterPipe implements PipeTransform {
  transform(items: any[], searchList: string[]): any[] {
    if (!items.length) return [];
    if (!searchList.length) return items;

    return items.filter((item) => {
      // Customize this condition based on your object's structure
      return searchList.includes(item.role);
    });
  }
}
