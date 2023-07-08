import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter((item) => {
      // Customize this condition based on your object's structure
      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.district?.toLowerCase().includes(searchText) ||
        item.displayName?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.group?.toLowerCase().includes(searchText)
      );
    });
  }
}
