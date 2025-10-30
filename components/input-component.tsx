"use client";
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";

type ValidatorFn = (val: string) => boolean;

interface ValidatedInputProps {
    placeholder?: string;
    className?: string;
    validator?: ValidatorFn[];
    onChange?: (value: string, isValid: boolean) => void;
    initialValue?: string;
    disabled?: boolean;
    tabIndex?: number;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
    tabIndex = 0,
    onKeyDown,
}, ref) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validate = (val: string = value): boolean => {
        const valid = validator.every(fn => fn(val));
        setError(!valid);
        if (onChange) onChange(val, valid);
        return valid;
    };

    useImperativeHandle(ref, () => ({
        validate,
        getValue: () => value,
        focus: () => inputRef.current?.focus(),
        reset: () => {
            setValue("");
            setError(false);
        }
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue(val);
        validate(val);
    };

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <div className={`flex flex-col ${className}`}>
            <input
                type="text"
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                tabIndex={tabIndex}
                disabled={disabled}
                className={`
                    px-3 py-2 rounded-md border-2
                    ${error ? "border-[#ef4444]" : "border-primary"}
                    bg-background text-foreground
                    focus:outline-none focus:border-foreground/30
                    transition-colors duration-200
                `}
            />
        </div>
    );
});

ValidatedInput.displayName = "ValidatedInput";
export default ValidatedInput;
