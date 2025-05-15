import React from 'react';
import KanbanBoard from './KanbanBoard';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <KanbanBoard />
    </ErrorBoundary>
  );
}

export default App;
