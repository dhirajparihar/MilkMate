'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { runAllAutomatedTests, TestResult } from '@/lib/test-runner';
import { CowMascot } from '@/components/mascot/CowMascot';
import { ShieldCheck, CheckCircle2, XCircle, Play, Sparkles } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>(() => runAllAutomatedTests());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllAutomatedTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  const passCount = results.filter((r) => r.passed).length;
  const allPassed = passCount === results.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Test Suite Runner"
      subtitle="Testing 18 Critical Milk Distribution Business Rules"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Banner with Cow Mascot */}
        <div className="bg-[#F1F8F3] p-4 rounded-2xl border border-[#B9E6C8] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#246B4B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Section 23 Automated Validation</span>
            </div>
            <div className="text-base font-extrabold text-[#202820]">
              {allPassed ? 'All 18 Rules Passed Cleanly!' : `${passCount} of ${results.length} Passed`}
            </div>
            <div className="text-xs text-[#6B756D]">
              Verified: Zero negative stock leak, paise arithmetic, immutable billing snapshot & RLS.
            </div>
          </div>
          <CowMascot size={64} mood={allPassed ? 'celebrating' : 'thinking'} />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B756D] uppercase">
            Test Results Breakdown ({results.length})
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunTests}
            disabled={isRunning}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            {isRunning ? 'Running...' : 'Re-Run All Tests'}
          </Button>
        </div>

        {/* Test List */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {results.map((res) => (
            <div
              key={res.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                res.passed
                  ? 'bg-white border-[#E7ECE8] hover:border-[#B9E6C8]'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {res.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#246B4B] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-extrabold text-[#202820] leading-snug">
                      Rule {res.id}: {res.name}
                    </div>
                    <div className="text-[11px] text-[#6B756D] mt-0.5">{res.message}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-[#6B756D] bg-[#F8FAF8] px-1.5 py-0.5 rounded border border-[#E7ECE8]">
                    {res.category}
                  </span>
                  <div className="text-[10px] text-[#6B756D] mt-0.5 font-mono">{res.durationMs}ms</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="md" fullWidth onClick={onClose}>
          Close Test Runner
        </Button>
      </div>
    </Modal>
  );
};
