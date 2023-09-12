export interface ImageItemProps {
  title: string;
  value: File | null;
  onChange: (newValue: File | null) => void;
}
