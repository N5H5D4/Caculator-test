import React from 'react';
import { HistoryItem } from '../types';
import { Trash2, X, Clock, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
history: HistoryItem[];
onClearHistory: () => void;
onSelectHistory: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistory,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="history-panel-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            id="history-panel-modal"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-sm bg-neutral-900/95 backdrop-blur-md border border-neutral-800 text-neutral-100 rounded-[32px] p-6 shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-medium text-neutral-200">Lịch sử tính toán</h3>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    id="clear-history-btn"
                    onClick={onClearHistory}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Xóa toàn bộ lịch sử"
                    aria-label="Xóa toàn bộ lịch sử"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  id="close-history-btn"
                  onClick={onClose}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-500 text-sm">
                  <Clock className="w-10 h-10 mb-2 stroke-[1.5] text-neutral-700" />
                  <p>Chưa có lịch sử phép tính nào</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    id={`history-item-${item.id}`}
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="w-full text-right p-3.5 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 transition-all group flex flex-col items-end"
                  >
                    <div className="flex items-center justify-between w-full text-xs text-neutral-400 mb-1">
                      <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 text-orange-400 font-medium transition-opacity">
                        Sử dụng lại <ArrowUpRight className="w-3 h-3" />
                      </span>
                      <span className="font-mono">{item.expression}</span>
                    </div>
                    <div className="text-xl font-light text-neutral-100 tracking-tight font-mono">
                      = {item.result}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
