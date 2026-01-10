import {
  ChangeDetectionStrategy,
  Component,
  computed
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import {Dropdown} from './dropdown/dropdown';
import {JsonPipe} from '@angular/common';
import {
  areas,
  districts
} from './data';
import {DropdownGroup} from './dropdown/dropdown.interface';
import {toSignal} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [Dropdown, JsonPipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly districts = districts;

  readonly districtsControl = new FormControl<string[]>(districts.map(d => d.value), {nonNullable: true});
  readonly areasControl = new FormControl<string[]>([], {nonNullable: true});

  readonly selectedDistricts = toSignal(
    this.districtsControl.valueChanges.pipe(
      startWith(this.districtsControl.value)
    )
  );

  readonly areaGroups = computed<DropdownGroup[]>(() => {
    const selectedDistricts = this.selectedDistricts();

    return districts.map((district) => ({
      id: district.value,
      label: district.label,
      disabled: !selectedDistricts?.includes(district.value),
      items: areas.filter((a) => a.district === district.value),
    }));
  });
}
