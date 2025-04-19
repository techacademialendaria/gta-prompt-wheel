import { useState, useEffect } from "react";
import { listen } from '@tauri-apps/api/event';
import "./App.css";
import WheelComponent from "./components/wheel/WheelComponent";
import CategoryIndicator from "./components/wheel/CategoryIndicator";
import { usePrompts } from "./hooks/usePrompts";
import { clipboardService } from "./services/clipboardService";

function App() {
  const [isWheelVisible, setIsWheelVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showDebug, setShowDebug] = useState(false);
  
  const { 
    prompts, 
    categories,
    currentCategoryId, 
    changeCategory,
    usePrompt 
  } = usePrompts();

  // Listener for global shortcut event from Tauri backend
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen('global-shortcut-triggered', (event) => {
          console.log(`Global shortcut event received: ${event.payload}`);
          // TODO: Possibly use event.payload if needed in the future
          // Ação: Mostrar a roda
          setIsWheelVisible(true); 
        });
      } catch (e) {
        console.error("Failed to set up global shortcut listener:", e);
      }
    };

    setupListener();

    return () => {
      unlisten?.(); // Cleanup the listener on component unmount
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Handle keyboard shortcuts to show/hide wheel (OLD logic)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Continuamente atualizar a posição do mouse
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show the wheel when Alt+Shift is pressed (OLD LOGIC - handled by global shortcut now)
      // if (e.altKey && e.shiftKey) {
      //   setShowDebug(e.ctrlKey);
      //   setIsWheelVisible(true);
      // }

      // Example: Keep Esc key to hide the wheel
      if (e.key === 'Escape') {
        setIsWheelVisible(false);
        setShowDebug(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Hide the wheel when either Alt or Shift is released (MAYBE REMOVE/ADJUST THIS?)
      // Keeping it for now, might conflict or be redundant with global shortcut
      if (!e.altKey || !e.shiftKey) {
        // Consider removing this if Escape or clicking outside is preferred
        // setIsWheelVisible(false); 
        // setShowDebug(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle prompt selection
  const handleSelectPrompt = async (promptId: string) => {
    const promptContent = await usePrompt(promptId);
    
    if (promptContent) {
      await clipboardService.writeText(promptContent);
      // For web demo, we'll show an alert
      // In the real app, this would paste directly
      alert(`Prompt copied to clipboard: ${promptContent}`);
    }
    
    setIsWheelVisible(false);
    setShowDebug(false);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {isWheelVisible && (
        <>
          {/* Wheel Component */}
          <WheelComponent 
            prompts={prompts.map(p => ({ 
              id: p.id, 
              content: p.content,
              icon: p.iconPath 
            }))}
            onSelect={handleSelectPrompt}
            onClose={() => setIsWheelVisible(false)}
            mousePosition={mousePosition}
            showDebugInfo={showDebug}
          />
          
          {/* Indicador de categorias - separado da roda mas visível junto */}
          <div className="fixed top-10 right-10 z-20 pointer-events-auto">
            <CategoryIndicator 
              categories={categories} 
              currentCategoryId={currentCategoryId} 
              onCategoryChange={changeCategory}
            />
          </div>
        </>
      )}
    </main>
  );
}

export default App;
