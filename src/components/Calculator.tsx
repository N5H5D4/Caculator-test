import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Operation, HistoryItem, Theme } from '../types';
import { calculate, formatDisplayNumber } from '../utils/calculator';
import { HistoryPanel } from './HistoryPanel';
import { 
  Delete, 
  History as HistoryIcon, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  Divide, 
  X as MultiplyIcon, 
  Minus, 
  Plus, 
  Equal, 
  Percent
} from 'lucide-react';
import { motion } from 'motion/react';

export const Calculator: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [overwrite, setOverwrite] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');

  // Input a digit
  const handleDigit == useCallback((digit: string) => {
    setCurrentValue((prev) => {
      if (prev === 'Error' || prev === 'Infinity' || prev === '-Infinity') {
        setOverwrite(false);
        return digit;
      }
      if (overwrite) {
        setOverwrite(false);
        return digit;
      }
      if (prev === '0') {
        return digit;
      }
      if (prev.length >= 15) return prev; // Limit display length
      return prev + digit;
    });
  }, [overwrite]);

  // Input a decimal dot
  const handleDecimal = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === 'Error' || prev === 'Infinity' || prev === '-Infinity') {
        setOverwrite(false);
        return '0.';
      }
      if (overwrite) {
        setOverwrite(false);
        return '0.';
      }
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  }, [overwrite]);

  // Toggle positive/negative sign
  const handleToggleSign = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === '0' || prev === 'Error') return prev;
      if (prev.startsWith('-')) {
        return prev.slice(1);
      }
      return '-' + prev;
    });
  }, []);

  // Percentage
  const handlePercent = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === 'Error') return prev;
      const num = parseFloat(prev);
      if (isNaN(num)) return prev;
      const result = num / 100;
      return String(Number(Math.round(Number(result + 'e12')) + 'e-12'));
    });
  }, []);

  // Backspace / Delete last digit
  const handleDelete = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === 'Error' || overwrite) {
        setOverwrite(false);
        return '0';
      }
      if (prev.length === 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [overwrite]);

  // All Clear
  const handleClear = useCallback(() => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
    setExpression('');
    setOverwrite(false);
  }, []);

  // Select an arithmetic operator (+, -, ×, ÷)
  const handleOperation = useCallback((op: Operation) => {
    if (currentValue === 'Error') return;

    if (previousValue === null) {
      setPreviousValue(currentValue);
      setOperation(op);
      setExpression(`${formatDisplayNumber(currentValue)} ${op}`);
      setOverwrite(true);
    } else if (operation) {
      if (overwrite) {
        // Just change the operator
        setOperation(op);
        setExpression(`${formatDisplayNumber(previousValue)} ${op}`);
      } else {
        // Calculate the intermediate step
        const prevNum = parseFloat(previousValue);
        const currNum = parseFloat(currentValue);
        const calcResult = calculate(prevNum, currNum, operation);

        if (calcResult === 'Error') {
          setCurrentValue('Error');
          setPreviousValue(null);
          setOperation(null);
          setExpression('');
          setOverwrite(true);
        } else {
          const resStr = String(calcResult);
          setPreviousValue(resStr);
          setCurrentValue(resStr);
          setOperation(op);
          setExpression(`${formatDisplayNumber(resStr)} ${op}`);
          setOverwrite(true);
        }
      }
    }
  }, [currentValue, previousValue, operation, overwrite]);

  // Equals / Calculate
  const handleEquals = useCallback(() => {
    if (previousValue === null || operation === null || currentValue === 'Error') {
      return;
    }

    const prevNum = parseFloat(previousValue);
    const currNum = parseFloat(currentValue);
    const calcResult = calculate(prevNum, currNum, operation);

    const fullExpression = `${formatDisplayNumber(previousValue)} ${operation} ${formatDisplayNumber(currentValue)}`;

    if (calcResult === 'Error') {
      setCurrentValue('Error');
      setPreviousValue(null);
      setOperation(null);
      setExpression(`${fullExpression} =`);
      setOverwrite(true);
    } else {
      const resStr = String(calcResult);
      const formattedRes = formatDisplayNumber(resStr);

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: fullExpression,
        result: formattedRes,
        timestamp: new Date(),
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);

      setExpression(`${fullExpression} =`);
      setCurrentValue(resStr);
      setPreviousValue(null);
      setOperation(null);
      setOverwrite(true);
    }
  }, [previousValue, operation, currentValue]);

  // Copy result to clipboard
  const handleCopy = () => {
    if (currentValue === 'Error') return;
    navigator.clipboard.writeText(currentValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling on certain keys
      if (['+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace'].includes(e.key)) {
        e.preventDefault();
      }

      setActiveKey(e.key);
      setTimeout(() => setActiveKey(null), 150);

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperation('+');
      } else if (e.key === '-') {
        handleOperation('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        handleOperation('×');
      } else if (e.key === '/') {
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      } else if (e.key === '%') {
        handlePercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperation, handleEquals, handleDelete, handleClear, handlePercent]);

  // Display font sizing based on length
  const getDisplayFontSize = (text: string) => {
    const len = text.length;
    if (len > 14) return 'text-3xl sm:text-4xl';
    if (len > 9) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="app-wrapper"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 select-none ${
        isDark ? 'bg-[#0a0a0a] text-neutral-200' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      <motion.div
        id="calculator-container"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`w-full max-w-[400px] rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl transition-all duration-300 border backdrop-blur-md ${
          isDark 
            ? 'bg-neutral-900/50 border-neutral-800 shadow-black/80' 
            : 'bg-white border-neutral-200 shadow-neutral-300/60'
        }`}
      >
        {/* Top bar with Precision header, status dots & controls */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
          <div className="flex items-center gap-2.5">
            <span className={`text-[10px] tracking-[0.2em] font-semibold uppercase ${
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              Precision v1.0
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator lights */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-2">
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}></div>
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}></div>
              <div className="w-2 h-2 rounded-full bg-orange-500/80 animate-pulse"></div>
            </div>

            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isDark 
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            <button
              id="history-toggle-btn"
              onClick={() => setIsHistoryOpen(true)}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                isDark 
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80' 
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title="Xem lịch sử tính toán"
              aria-label="Lịch sử"
            >
              <HistoryIcon className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-neutral-900"></span>
              )}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div
          id="calculator-display"
          className="mb-8 sm:mb-10 px-1 text-right relative group"
        >
          {/* Copy Button */}
          <button
            id="copy-result-btn"
            onClick={handleCopy}
            className={`absolute -top-6 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs flex items-center gap-1 ${
              isDark ? 'text-neutral-500 hover:text-orange-400' : 'text-neutral-400 hover:text-orange-600'
            }`}
            title="Sao chép kết quả"
            aria-label="Sao chép kết quả"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">Sao chép</span>
              </>
            )}
          </button>

          {/* Sub-expression / Calculation trail */}
          <div className="h-6 flex items-center justify-end text-right overflow-hidden mb-1">
            <span className={`text-sm font-mono tracking-wider transition-colors ${
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              {expression || '\u00A0'}
            </span>
          </div>

          {/* Main Number Display */}
          <div className="flex items-baseline justify-end overflow-hidden">
            <span
              id="display-value"
              className={`font-light tracking-tighter font-mono transition-all duration-100 ${getDisplayFontSize(
                formatDisplayNumber(currentValue)
              )} ${isDark ? 'text-white' : 'text-neutral-900'}`}
            >
              {formatDisplayNumber(currentValue)}
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {/* Row 1: AC, Del / ±, %, ÷ */}
          <button
            id="btn-clear"
            onClick={handleClear}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/50 hover:bg-neutral-700 text-orange-400'
                : 'bg-neutral-200 hover:bg-neutral-300 text-orange-600'
            }`}
          >
            AC
          </button>
          <button
            id="btn-toggle-sign"
            onClick={handleToggleSign}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/50 hover:bg-neutral-700 text-orange-400'
                : 'bg-neutral-200 hover:bg-neutral-300 text-orange-600'
            }`}
            title="Đổi dấu âm/dương"
            aria-label="Đổi dấu"
          >
            +/-
          </button>
          <button
            id="btn-percent"
            onClick={handlePercent}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-medium transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/50 hover:bg-neutral-700 text-orange-400'
                : 'bg-neutral-200 hover:bg-neutral-300 text-orange-600'
            }`}
            aria-label="Phần trăm"
          >
            %
          </button>
          <button
            id="btn-divide"
            onClick={() => handleOperation('÷')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all active:scale-95 text-white ${
              operation === '÷' && !overwrite
                ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2 ring-offset-neutral-900 shadow-lg shadow-orange-900/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-950/40'
            }`}
            aria-label="Chia"
          >
            ÷
          </button>

          {/* Row 2: 7, 8, 9, × */}
          <button
            id="btn-7"
            onClick={() => handleDigit('7')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            7
          </button>
          <button
            id="btn-8"
            onClick={() => handleDigit('8')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            8
          </button>
          <button
            id="btn-9"
            onClick={() => handleDigit('9')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            9
          </button>
          <button
            id="btn-multiply"
            onClick={() => handleOperation('×')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all active:scale-95 text-white ${
              operation === '×' && !overwrite
                ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2 ring-offset-neutral-900 shadow-lg shadow-orange-900/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-950/40'
            }`}
            aria-label="Nhân"
          >
            ×
          </button>

          {/* Row 3: 4, 5, 6, - */}
          <button
            id="btn-4"
            onClick={() => handleDigit('4')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            4
          </button>
          <button
            id="btn-5"
            onClick={() => handleDigit('5')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            5
          </button>
          <button
            id="btn-6"
            onClick={() => handleDigit('6')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            6
          </button>
          <button
            id="btn-subtract"
            onClick={() => handleOperation('-')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all active:scale-95 text-white ${
              operation === '-' && !overwrite
                ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2 ring-offset-neutral-900 shadow-lg shadow-orange-900/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-950/40'
            }`}
            aria-label="Trừ"
          >
            -
          </button>

          {/* Row 4: 1, 2, 3, + */}
          <button
            id="btn-1"
            onClick={() => handleDigit('1')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            1
          </button>
          <button
            id="btn-2"
            onClick={() => handleDigit('2')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            2
          </button>
          <button
            id="btn-3"
            onClick={() => handleDigit('3')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            3
          </button>
          <button
            id="btn-add"
            onClick={() => handleOperation('+')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-medium transition-all active:scale-95 text-white ${
              operation === '+' && !overwrite
                ? 'bg-orange-500 ring-2 ring-orange-300 ring-offset-2 ring-offset-neutral-900 shadow-lg shadow-orange-900/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-950/40'
            }`}
            aria-label="Cộng"
          >
            +
          </button>

          {/* Row 5: 0 (span 2 or with delete), ., = */}
          <button
            id="btn-0"
            onClick={() => handleDigit('0')}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            0
          </button>
          <button
            id="btn-decimal"
            onClick={handleDecimal}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-white'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
            }`}
          >
            .
          </button>
          <button
            id="btn-delete"
            onClick={handleDelete}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-lg transition-all active:scale-95 ${
              isDark
                ? 'bg-neutral-800/30 hover:bg-neutral-700 text-neutral-400 hover:text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
            title="Xóa ký tự cuối"
            aria-label="Xóa"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            id="btn-equals"
            onClick={handleEquals}
            className={`h-14 sm:h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all active:scale-95 ${
              isDark
                ? 'bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black shadow-lg shadow-white/10'
                : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white shadow-lg shadow-neutral-900/30'
            }`}
            aria-label="Bằng"
          >
            =
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className={`mt-5 pt-3 border-t text-center text-xs flex items-center justify-center gap-1.5 ${
          isDark ? 'border-neutral-800/60 text-neutral-500' : 'border-neutral-200 text-neutral-400'
        }`}>
          <span>Bàn phím:</span>
          <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${isDark ? 'bg-neutral-800/60 text-neutral-400' : 'bg-neutral-200 text-neutral-600'}`}>0-9</kbd>
          <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${isDark ? 'bg-neutral-800/60 text-neutral-400' : 'bg-neutral-200 text-neutral-600'}`}>+ - * /</kbd>
          <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${isDark ? 'bg-neutral-800/60 text-neutral-400' : 'bg-neutral-200 text-neutral-600'}`}>Enter</kbd>
          <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${isDark ? 'bg-neutral-800/60 text-neutral-400' : 'bg-neutral-200 text-neutral-600'}`}>Esc</kbd>
        </div>
      </motion.div>

      {/* Decorative footer badge */}
      <div className={`mt-8 sm:mt-10 text-[11px] tracking-widest uppercase flex items-center gap-4 ${
        isDark ? 'text-neutral-600' : 'text-neutral-400'
      }`}>
        <div className={`h-[1px] w-8 ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}></div>
        <span>Computational Design Interface</span>
        <div className={`h-[1px] w-8 ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}></div>
      </div>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        onSelectHistory={(item) => {
          // Remove comma formatting for calculation state
          const raw = item.result.replace(/,/g, '');
          setCurrentValue(raw);
          setPreviousValue(null);
          setOperation(null);
          setExpression(`${item.expression} =`);
          setOverwrite(true);
        }}
      />
    </div>
  );
};
