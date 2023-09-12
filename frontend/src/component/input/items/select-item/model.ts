export interface SelectItemProps<T> {
  title: string;
  value: T;
  onChange: (newValue: T) => void;
  options: { value: T }[];
}
