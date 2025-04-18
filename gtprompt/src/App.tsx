import { useState, useEffect } from "react";
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

  // Handle keyboard shortcuts to show/hide wheel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Continuamente atualizar a posição do mouse
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show the wheel when Alt+Shift is pressed
      if (e.altKey && e.shiftKey) {
        // Use posição atual do mouse quando as teclas são pressionadas
        setShowDebug(e.ctrlKey);
        setIsWheelVisible(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Hide the wheel when either Alt or Shift is released
      if (!e.altKey || !e.shiftKey) {
        setIsWheelVisible(false);
        setShowDebug(false);
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
          <WheelComponent 
            prompts={prompts.map(p => ({ 
              id: p.id, 
              content: p.content,
              icon: p.iconPath 
            }))}
            categories={categories}
            currentCategoryId={currentCategoryId}
            onCategoryChange={changeCategory}
            onSelect={handleSelectPrompt}
            onClose={() => setIsWheelVisible(false)}
            mousePosition={mousePosition}
            showDebugInfo={showDebug}
          />
          
          <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
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
