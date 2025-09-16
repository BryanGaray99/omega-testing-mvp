import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ExecutionEvent } from '@/hooks/useExecutionEvents';

interface ExecutionState {
  [executionId: string]: {
    isExecuting: boolean;
    showExecuted: boolean;
    progress?: number;
    message?: string;
  };
}

interface SuiteExecutionMapping {
  [suiteId: string]: string; // suiteId -> executionId mapping
}



interface ExecutionContextType {
  executionState: ExecutionState;
  startExecution: (executionId: string) => void;
  completeExecution: (executionId: string) => void;
  failExecution: (executionId: string, error: string) => void;
  updateExecutionProgress: (executionId: string, progress: number, message?: string) => void;
  isExecuting: (executionId: string) => boolean;
  showExecuted: (executionId: string) => boolean;
  getExecutionMessage: (executionId: string) => string | undefined;
  setSuiteExecutionId: (suiteId: string, executionId: string) => void;
  getSuiteExecutionId: (suiteId: string) => string | undefined;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [executionState, setExecutionState] = useState<ExecutionState>({});
  const [suiteExecutionMapping, setSuiteExecutionMapping] = useState<SuiteExecutionMapping>({});

  const startExecution = useCallback((executionId: string) => {
    console.log('ExecutionContext - startExecution called for:', executionId);
    setExecutionState(prev => {
      const newState = {
        ...prev,
        [executionId]: {
          isExecuting: true,
          showExecuted: false,
          progress: 0,
          message: 'Ejecutando...',
        },
      };
      console.log('ExecutionContext - New state after startExecution:', newState);
      return newState;
    });
  }, []);

  const completeExecution = useCallback((executionId: string) => {
    console.log('ExecutionContext - completeExecution called for:', executionId);
    setExecutionState(prev => {
      const newState = {
        ...prev,
        [executionId]: {
          isExecuting: false,
          showExecuted: true,
          progress: 100,
          message: 'Ejecutado',
        },
      };
      console.log('ExecutionContext - New state after completeExecution:', newState);
      return newState;
    });

    // Ocultar "Ejecutado" después de 5 segundos
    setTimeout(() => {
      console.log('ExecutionContext - Hiding executed status for:', executionId);
      setExecutionState(prev => ({
        ...prev,
        [executionId]: {
          isExecuting: false,
          showExecuted: false,
          progress: 0,
          message: undefined,
        },
      }));
    }, 5000);
  }, []);

  const failExecution = useCallback((executionId: string, error: string) => {
    setExecutionState(prev => ({
      ...prev,
      [executionId]: {
        isExecuting: false,
        showExecuted: false,
        progress: 0,
        message: `Error: ${error}`,
      },
    }));

    // Limpiar mensaje de error después de 5 segundos
    setTimeout(() => {
      setExecutionState(prev => ({
        ...prev,
        [executionId]: {
          isExecuting: false,
          showExecuted: false,
          progress: 0,
          message: undefined,
        },
      }));
    }, 5000);
  }, []);

  const updateExecutionProgress = useCallback((executionId: string, progress: number, message?: string) => {
    setExecutionState(prev => ({
      ...prev,
      [executionId]: {
        ...prev[executionId],
        progress,
        message: message || prev[executionId]?.message,
      },
    }));
  }, []);

  const isExecuting = useCallback((executionId: string) => {
    const result = executionState[executionId]?.isExecuting || false;
    return result;
  }, [executionState]);

  const showExecuted = useCallback((executionId: string) => {
    const result = executionState[executionId]?.showExecuted || false;
    return result;
  }, [executionState]);

  const getExecutionMessage = useCallback((executionId: string) => {
    return executionState[executionId]?.message;
  }, [executionState]);

  const setSuiteExecutionId = useCallback((suiteId: string, executionId: string) => {
    console.log('ExecutionContext - setSuiteExecutionId:', suiteId, '->', executionId);
    setSuiteExecutionMapping(prev => ({
      ...prev,
      [suiteId]: executionId,
    }));
  }, []);

  const getSuiteExecutionId = useCallback((suiteId: string) => {
    return suiteExecutionMapping[suiteId];
  }, [suiteExecutionMapping]);

  const value: ExecutionContextType = {
    executionState,
    startExecution,
    completeExecution,
    failExecution,
    updateExecutionProgress,
    isExecuting,
    showExecuted,
    getExecutionMessage,
    setSuiteExecutionId,
    getSuiteExecutionId,
  };

  return (
    <ExecutionContext.Provider value={value}>
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecution() {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error('useExecution must be used within an ExecutionProvider');
  }
  return context;
}
