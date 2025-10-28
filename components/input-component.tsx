import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";

type ValidatorFn = (val: string) => boolean;

interface ValidatedInputProps {
    placeholder?: string;
    className?: string;
    validator?: ValidatorFn[];
    onChange?: (value: string, isValid: boolean) => void;
    initialValue?: string;
    disabled?: boolean;
}

export interface ValidatedInputRef {
    validate: () => boolean;
    getValue: () => string;
    focus: () => void;
    reset: () => void;
}

const ValidatedInput = forwardRef<ValidatedInputRef, ValidatedInputProps>(({
    placeholder = "",
    className = "",
    validator = [],
    onChange,
    initialValue = "",
    disabled = false,
    ...props
}, ref) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(false);
    const [touched, setTouched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const validate = (): boolean => {
        setTouched(true);
        const valid = validator.every(fn => fn(value));
        setError(!valid);
        if (onChange) onChange(value, valid);
        return valid;
    };

    useImperativeHandle(ref, () => ({
        validate,
        getValue: () => value,
        focus: () => {
            inputRef.current?.focus();
        },
        reset: () => {
            setValue("");
            setError(false);
            setTouched(false);
        }
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (touched) validate();
    };

    const handleBlur = () => {
        setTouched(true);
        validate();
    };

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <div className={`flex flex-col ${className}`}>
            <input
                type="text"
                ref={inputRef}
                value={value ? value : ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                style={{ borderColor: error ? '#f87171' : '#393E46' }}
                className={`
                    px-3 py-2 rounded-md border border-primary bg-bg-input text-foreground
                    focus:outline-none
                    focus:border-[#888888]!
                    transition-colors duration-200
                `}
                {...props}
            />
        </div>
    );
});

export default ValidatedInput;
