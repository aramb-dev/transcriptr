import React from 'react';
import { Changelog } from './Changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <div
      id="changelog-modal"
      className="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto">
        <Changelog isModal={true} onClose={onClose} />
      </div>
    </div>
  );
}