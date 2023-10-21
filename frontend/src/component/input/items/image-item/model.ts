export interface ImageItemProps {
  title: string;
  value?: File;
  onChange: (newValue?: File) => void;
}
