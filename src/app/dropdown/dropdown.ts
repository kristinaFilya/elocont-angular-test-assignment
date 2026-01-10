import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { ClickOutsideDirective } from '../click-outside';
import {
  DropdownGroup,
  DropdownItem,
} from './dropdown.interface';

@Component({
  selector: 'dropdown',
  imports: [ClickOutsideDirective],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true,
    },
  ],
  host: {
    '(keydown.escape)': 'this.isOpen.set(false)',
  },
})
export class Dropdown implements ControlValueAccessor {
  items = input<DropdownItem[]>([]);
  groups = input<DropdownGroup[]>([]);
  multi = input<boolean>(false);
  placeholder = input<string>('Выберите элемент');
  search = input<boolean>(false);
  disabled = input<boolean>(false);

  readonly isOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedValuesSet = signal<Set<string>>(new Set());

  private readonly normalizedGroups = computed<DropdownGroup[]>(() => {
    const groups = this.groups();
    const items = this.items();

    if (groups.length > 0) {
      return groups;
    }

    if (items.length > 0) {
      return [{
        id: 'default',
        items: items,
      }];
    }

    return [];
  });

  readonly filteredGroups = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const groups = this.normalizedGroups();

    if (!query) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.items.length > 0);
  });

  readonly displayText = computed(() => {
    const selected = this.selectedValuesSet();
    const items = this.normalizedGroups().flatMap((g) => g.items);

    if (selected.size === 0) {
      return this.placeholder();
    }

    const selectedItems = items.filter((i) => selected.has(i.value));

    if (!this.multi()) {
      return selectedItems[0]?.label ?? this.placeholder();
    }

    if (selectedItems.length <= 2) {
      return selectedItems.map((i) => i.label).join(', ');
    }

    return `Выбрано: ${selectedItems.length}`;
  });

  toggle(): void {
    if (!this.disabled()) {
      this.isOpen.update((v) => !v);
    }
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onItemClick(item: DropdownItem, group: DropdownGroup): void {
    if (group.disabled || item.disabled) {
      return;
    }

    const next = new Set(this.selectedValuesSet());

    if (!this.multi()) {
      next.clear();
      next.add(item.value);
      this.isOpen.set(false);
    } else {
      next.has(item.value)
        ? next.delete(item.value)
        : next.add(item.value);
    }

    this.selectedValuesSet.set(next);
    this.onChange?.([...next]);
    this.onTouched?.();
  }

  isItemSelected(value: string): boolean {
    return this.selectedValuesSet().has(value);
  }

  private onChange: ((value: string[]) => void) | null = null;
  private onTouched: (() => void) | null = null;

  writeValue(value: string[] | null): void {
    this.selectedValuesSet.set(new Set(value ?? []));
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
