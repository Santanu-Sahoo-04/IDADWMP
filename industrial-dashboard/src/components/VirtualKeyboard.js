import React, { useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

export default function VirtualKeyboard({ value, onChange }) {
  const [keyboardValue, setKeyboardValue] = useState(value);

  // Sync with parent value changes
  useEffect(() => {
    setKeyboardValue(value);
  }, [value]);

  const handleKeyPress = (button) => {
    let newValue = keyboardValue;

    if (button === "{bksp}") {
      newValue = newValue.slice(0, -1);
    } else {
      newValue += button;
    }

    setKeyboardValue(newValue);
    onChange(newValue);
  };

  return (
    <Keyboard
      layout={{
        default: [
          "1 2 3 4 5 6 7 8 9 0 {bksp}",
          "q w e r t y u i o p",
          "a s d f g h j k l",
          "z x c v b n m",
          "@ # $ % & * - _ + = ! ?"
        ]
      }}
      onKeyPress={handleKeyPress}
      theme="hg-theme-default hg-layout-default"
      display={{ "{bksp}": "⌫" }}
      value={keyboardValue}
    />
  );
}
