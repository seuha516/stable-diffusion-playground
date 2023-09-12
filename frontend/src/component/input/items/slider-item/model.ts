export interface SliderItemProps {
  title: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  isInteger?: boolean;
}
