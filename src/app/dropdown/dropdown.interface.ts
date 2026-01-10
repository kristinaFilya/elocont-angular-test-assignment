export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownGroup {
  id: string;
  label?: string;
  disabled?: boolean;
  items: DropdownItem[];
}
