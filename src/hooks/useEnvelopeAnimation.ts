import { useState } from 'react';

export const useEnvelopeAnimation = () => {
    const [isFolding, setIsFolding] = useState(false);
    const [foldStep, setFoldStep] = useState(0);
    const [isReadyToSeal, setIsReadyToSeal] = useState(false);
    const [selectedSeal, setSelectedSeal] = useState<string | null>(null);
    const [isSent, setIsSent] = useState(false);

    const startFolding = () => {
        setIsFolding(true);
        setFoldStep(0);
        setSelectedSeal(null);
        setIsReadyToSeal(false);
    };

    const cancelFolding = () => {
        setIsFolding(false);
        setFoldStep(0);
        setSelectedSeal(null);
        setIsReadyToSeal(false);
    };

    const handleCloseEnvelope = () => {
        setFoldStep(1);
        // Sequence animations
        setTimeout(() => {
            setFoldStep(2);
            setTimeout(() => setIsReadyToSeal(true), 1500);
        }, 2000);
    };

    const handleApplySeal = (sealId: string) => {
        setSelectedSeal(sealId);
        setTimeout(() => setIsSent(true), 1500);
    };

    return {
        isFolding,
        foldStep,
        isReadyToSeal,
        selectedSeal,
        isSent,
        startFolding,
        cancelFolding,
        handleCloseEnvelope,
        handleApplySeal
    };
};