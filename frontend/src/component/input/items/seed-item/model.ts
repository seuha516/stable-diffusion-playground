export interface SeedItemProps {
  title: string;
  value: number | undefined;
  onChange: (newValue: number | undefined) => void;
}
