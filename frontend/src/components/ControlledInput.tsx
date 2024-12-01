import React, { useEffect, useRef, useState } from 'react';

interface ControlledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ControlledInput: React.FC<ControlledInputProps> = ({ value, onChange, ...rest }) => {
    const [cursor, setCursor] = useState<number | null>(null);
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const input = ref.current;
        if (input && cursor !== null) {
            input.setSelectionRange(cursor, cursor);
        }
    }, [ref, cursor, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.selectionStart || 0);
        if (onChange) {
            onChange(e);
        }
    };

    return <input onChange={handleChange} ref={ref} value={value} {...rest} />;
};

export default ControlledInput;
