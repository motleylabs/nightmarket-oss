import type { ChangeEvent } from 'react';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  classes?: string;
}

export const Toggle = ({ value, onChange, classes }: ToggleProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className={`toggle-input ${classes ?? ''}`}>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={handleChange} />
        <span className="slider round"></span>
      </label>
    </div>
  );
};
