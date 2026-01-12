interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  min?: number;
  disabled?: boolean;
  icon?: string;
}

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  min,
  disabled = false,
  icon,
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          disabled={disabled}
          className={`
            w-full px-4 py-3.5 
            bg-gray-50 border-2 border-gray-100 rounded-xl 
            focus:outline-none focus:border-blue-500 focus:bg-white 
            transition-all text-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        />
      </div>
      {maxLength && value && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {value.length}/{maxLength}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
}

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  error,
}: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full px-4 py-3.5 
          bg-gray-50 border-2 border-gray-100 rounded-xl 
          focus:outline-none focus:border-blue-500 focus:bg-white 
          transition-all text-gray-900 resize-none
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      />
      {maxLength && value && (
        <p className="text-xs text-gray-400 mt-1 text-right">
          {value.length}/{maxLength}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
