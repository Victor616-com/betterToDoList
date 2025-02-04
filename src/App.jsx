import { useMemo, useState, useRef, useEffect } from "react";
import './App.css'
import KanbanBoard from './components/KanbanBoard'


function App() {
  
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = (event) => {
    
    if (event.target.closest('.column')) {
        // Vertical scroll inside column
        event.target.closest('.column').scrollTop += event.deltaY;
    } else {
        // Horizontal scroll for main container
        scrollContainer.scrollLeft += event.deltaY;
        event.preventDefault();
    }
    };

    scrollContainer.addEventListener('wheel', handleScroll);

    return () => {
    scrollContainer.removeEventListener('wheel', handleScroll);
    };
}, []);
    

  return (
    <div className='app-wrapper' ref={scrollContainerRef}>
      <KanbanBoard />
    </div>
  )
}

export default App
