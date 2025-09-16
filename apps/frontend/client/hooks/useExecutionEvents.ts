import { useEffect, useRef, useCallback } from 'react';

export interface ExecutionEvent {
  executionId: string;
  type: 'started' | 'progress' | 'completed' | 'failed';
  status: string;
  progress?: number;
  message?: string;
  timestamp: string;
  projectId: string;
  entityName?: string;
  results?: any;
}

interface UseExecutionEventsProps {
  projectId: string;
  onExecutionStarted?: (event: ExecutionEvent) => void;
  onExecutionProgress?: (event: ExecutionEvent) => void;
  onExecutionCompleted?: (event: ExecutionEvent) => void;
  onExecutionFailed?: (event: ExecutionEvent) => void;
  enabled?: boolean;
}

export function useExecutionEvents({
  projectId,
  onExecutionStarted,
  onExecutionProgress,
  onExecutionCompleted,
  onExecutionFailed,
  enabled = true,
}: UseExecutionEventsProps) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !projectId) return;

    try {
      // Cerrar conexión existente si hay una
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Crear nueva conexión SSE
      const eventSource = new EventSource(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/v1/api'}/projects/${projectId}/test-execution/execution-events`
      );

      eventSource.onopen = () => {
        console.log('SSE connection opened for project:', projectId);
      };

      eventSource.onmessage = (event) => {
        try {
          console.log('Raw SSE event data:', event.data);
          // Primer parseo: obtener el objeto que contiene la clave 'data'
          const outerParsedData = JSON.parse(event.data);
          console.log('Parsed outer SSE event:', outerParsedData);

          // Segundo parseo: obtener el ExecutionEvent real del valor de 'outerParsedData.data'
          const data: ExecutionEvent = JSON.parse(outerParsedData.data);
          console.log('Parsed inner SSE event (ExecutionEvent):', data);
          
          // Manejar diferentes tipos de eventos
          switch (data.type) {
            case 'started':
              console.log('Handling started event for:', data.executionId);
              onExecutionStarted?.(data);
              break;
            case 'progress':
              console.log('Handling progress event for:', data.executionId);
              onExecutionProgress?.(data);
              break;
            case 'completed':
              console.log('Handling completed event for:', data.executionId);
              onExecutionCompleted?.(data);
              break;
            case 'failed':
              console.log('Handling failed event for:', data.executionId);
              onExecutionFailed?.(data);
              break;
            default:
              console.log('Unknown execution event type:', data.type, 'Full event:', data);
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        
        // Intentar reconectar después de 5 segundos
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect SSE...');
          connect();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error creating SSE connection:', error);
    }
  }, [projectId, enabled, onExecutionStarted, onExecutionProgress, onExecutionCompleted, onExecutionFailed]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: !!eventSourceRef.current,
  };
}
