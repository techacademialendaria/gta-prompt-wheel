import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface CategoryIndicatorProps {
  categories: Category[];
  currentCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryIndicator: React.FC<CategoryIndicatorProps> = ({
  categories,
  currentCategoryId,
  onCategoryChange
}) => {
  // Ordenar categorias por posição
  const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
  
  // Encontrar o índice da categoria atual
  const currentIndex = sortedCategories.findIndex(c => c.id === currentCategoryId);
  
  // Função para mudar para a próxima categoria
  const nextCategory = () => {
    const nextIndex = (currentIndex + 1) % sortedCategories.length;
    onCategoryChange(sortedCategories[nextIndex].id);
  };
  
  // Função para mudar para a categoria anterior
  const prevCategory = () => {
    const prevIndex = currentIndex <= 0 ? sortedCategories.length - 1 : currentIndex - 1;
    onCategoryChange(sortedCategories[prevIndex].id);
  };
  
  // Detectar evento de roda do mouse
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        nextCategory();
      } else if (e.deltaY < 0) {
        prevCategory();
      }
    };
    
    window.addEventListener('wheel', handleWheel);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentCategoryId, categories]);
  
  if (categories.length <= 1) return null;
  
  return (
    <motion.div 
      className="bg-gray-800 bg-opacity-80 rounded-full px-4 py-2 flex items-center space-x-2"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Indicador de categorias anteriores */}
      {currentIndex > 0 && (
        <button 
          className="text-white opacity-50 hover:opacity-100 focus:outline-none"
          onClick={prevCategory}
        >
          ◀
        </button>
      )}
      
      {/* Categoria atual */}
      <div 
        className="px-3 py-1 rounded-full text-white font-semibold"
        style={{ backgroundColor: sortedCategories[currentIndex]?.color || '#6366f1' }}
      >
        {sortedCategories[currentIndex]?.name || 'General'}
      </div>
      
      {/* Indicador de próximas categorias */}
      {currentIndex < sortedCategories.length - 1 && (
        <button 
          className="text-white opacity-50 hover:opacity-100 focus:outline-none"
          onClick={nextCategory}
        >
          ▶
        </button>
      )}
      
      {/* Instrução */}
      <div className="text-xs text-white opacity-70 ml-2">
        Use a roda do mouse para alternar
      </div>
    </motion.div>
  );
};

export default CategoryIndicator; 