import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import CategoryIndicator from './CategoryIndicator';

interface Category {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface Prompt {
  id: string;
  content: string;
  icon?: string;
}

interface WheelComponentProps {
  prompts: Prompt[];
  categories: Category[];
  currentCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onSelect: (promptId: string) => void;
  onClose: () => void;
  mousePosition: { x: number, y: number };
}

// Prompts de demonstração para exibir quando nenhum prompt é fornecido
const DEMO_PROMPTS: Prompt[] = [
  { id: 'demo1', content: 'Escreva um blog post', icon: '📝' },
  { id: 'demo2', content: 'Sumarize este artigo', icon: '📋' },
  { id: 'demo3', content: 'Traduza para espanhol', icon: '🌎' },
  { id: 'demo4', content: 'Corrija a gramática', icon: '✏️' },
  { id: 'demo5', content: 'Gere uma imagem', icon: '🖼️' },
  { id: 'demo6', content: 'Explique esse código', icon: '💻' },
  { id: 'demo7', content: 'Escreva um email', icon: '📨' },
  { id: 'demo8', content: 'Crie um script', icon: '🔄' },
];

const WheelComponent: React.FC<WheelComponentProps> = ({ 
  prompts: providedPrompts, 
  categories, 
  currentCategoryId,
  onCategoryChange,
  onSelect, 
  onClose,
  mousePosition
}) => {
  // Usar prompts de demonstração se nenhum prompt for fornecido
  const prompts = useMemo(() => {
    return providedPrompts && providedPrompts.length > 0 
      ? providedPrompts 
      : DEMO_PROMPTS;
  }, [providedPrompts]);

  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [wheelPosition, setWheelPosition] = useState(mousePosition);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [debugInfo, setDebugInfo] = useState({ 
    mouseX: 0, 
    mouseY: 0, 
    relX: 0, 
    relY: 0, 
    distance: 0, 
    angle: 0, 
    adjustedAngle: 0, 
    segmentIndex: -1,
    rawMouseAngle: 0 
  });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Valores calculados baseados no tamanho atual - useMemo para otimizar
  const calculatedValues = useMemo(() => {
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const wheelRadius = Math.min(size.width, size.height) * 0.4;
    const segmentCount = 8;
    // O ângulo de cada segmento em radianos
    const segmentAngle = (2 * Math.PI) / segmentCount;
    
    // Raios para detecção de interação - mais amplos para facilitar a seleção
    const innerDetectionRadius = wheelRadius * 0.15;
    const outerDetectionRadius = wheelRadius * 1.8;
    
    return {
      centerX,
      centerY,
      wheelRadius,
      segmentCount,
      segmentAngle,
      innerDetectionRadius,
      outerDetectionRadius
    };
  }, [size]);
  
  // Logs reduzidos - apenas inicialização
  useEffect(() => {
    console.log('--- Wheel Component Initialization ---');
    console.log('Initial Mouse Position:', mousePosition);
    console.log('Wheel Size:', size);
    console.log('Center X/Y:', calculatedValues.centerX, calculatedValues.centerY);
    console.log('Detection Radii:', { 
      inner: calculatedValues.innerDetectionRadius, 
      outer: calculatedValues.outerDetectionRadius 
    });
    console.log('Using prompts:', prompts.map(p => p.content));
  }, []);

  // Ajustar tamanho baseado no tamanho da tela e definir posição inicial (apenas uma vez)
  useEffect(() => {
    const updateSizeAndPosition = () => {
      // Definir tamanho responsivo baseado no viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Em telas menores, usar um tamanho menor para a roda
      const baseSize = Math.min(
        Math.min(viewportWidth, viewportHeight) * 0.7, // 70% da menor dimensão
        500 // Tamanho máximo
      );
      
      setSize({
        width: baseSize,
        height: baseSize
      });
      
      // Garantir que a wheel fique completamente dentro da tela
      const wheelX = Math.min(
        Math.max(mousePosition.x, baseSize / 2),
        viewportWidth - baseSize / 2
      );
      
      const wheelY = Math.min(
        Math.max(mousePosition.y, baseSize / 2),
        viewportHeight - baseSize / 2
      );
      
      console.log('Wheel Positioned at:', { x: wheelX, y: wheelY });
      
      setWheelPosition({ x: wheelX, y: wheelY });
    };
    
    // Definir tamanho e posição apenas uma vez na montagem
    updateSizeAndPosition();
    
    // Ajustar apenas o tamanho (não a posição) se a janela for redimensionada
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const baseSize = Math.min(
        Math.min(viewportWidth, viewportHeight) * 0.7,
        500
      );
      
      setSize({
        width: baseSize,
        height: baseSize
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Removida a dependência mousePosition para que execute apenas uma vez

  // Memoize segments calculation to avoid recalculations
  const segments = useMemo(() => {
    const { centerX, centerY, wheelRadius, segmentCount, segmentAngle } = calculatedValues;
    
    return Array.from({ length: segmentCount }).map((_, index) => {
      // Ângulo central do segmento (0 = topo, aumentando no sentido horário)
      // Começamos no topo (270° ou 3π/2) e vamos no sentido horário 
      const angle = (Math.PI * 3 / 2) - index * segmentAngle;
      const x = centerX + wheelRadius * Math.cos(angle);
      const y = centerY + wheelRadius * Math.sin(angle);
      
      return {
        index,
        x,
        y,
        angle,
        prompt: prompts[index] || null,
        startAngle: angle + segmentAngle / 2,
        endAngle: angle - segmentAngle / 2,
      };
    });
  }, [calculatedValues, prompts]);

  useEffect(() => {
    const { centerX, centerY, innerDetectionRadius, outerDetectionRadius, segmentCount } = calculatedValues;
    
    const handleMouseMove = (event: MouseEvent) => {
      // Calcular posição do mouse em relação ao centro real da roda na tela
      const actualWheelCenterX = wheelPosition.x;
      const actualWheelCenterY = wheelPosition.y;
      
      // Calcular a posição relativa do mouse em relação ao centro da roda
      const relX = event.clientX - actualWheelCenterX;
      const relY = event.clientY - actualWheelCenterY;
      
      // Log para debug
      console.log('Mouse position:', { 
        clientX: event.clientX, 
        clientY: event.clientY,
        wheelCenter: { x: actualWheelCenterX, y: actualWheelCenterY },
        relative: { x: relX, y: relY }
      });
      
      // Calcular a distância do mouse ao centro da roda
      const distance = Math.sqrt(relX * relX + relY * relY);
      
      // Método simplificado: calcular o ângulo do mouse e mapear diretamente para o segmento
      // Math.atan2 retorna ângulos entre -PI e PI, com 0 à direita (eixo x positivo)
      let angle = Math.atan2(relY, relX);
      
      // Converter para ângulos entre 0 e 2*PI
      if (angle < 0) angle += 2 * Math.PI;
      
      // Ajustar o ângulo para que o segmento 0 fique no topo (rotação de -90°)
      // 0° em atan2 é à direita, mas queremos que 0° seja no topo
      let offsetAngle = (angle + Math.PI / 2) % (2 * Math.PI);
      
      // Mapear o ângulo para um índice de segmento (sentido horário)
      const segmentAngle = (2 * Math.PI) / segmentCount;
      
      // Para um mapeamento no sentido horário, inverter a direção do ângulo
      let clockwiseAngle = (2 * Math.PI - offsetAngle) % (2 * Math.PI);
      const segmentIndex = Math.floor(clockwiseAngle / segmentAngle);
      
      // Log para debug dos ângulos
      console.log('Angle calculations:', {
        originalAngle: angle * (180 / Math.PI),
        offsetAngle: offsetAngle * (180 / Math.PI),
        clockwiseAngle: clockwiseAngle * (180 / Math.PI),
        segmentAngle: segmentAngle * (180 / Math.PI),
        segmentIndex
      });
      
      // Converter para graus para visualização no debug
      const angleInDegrees = angle * (180 / Math.PI);
      
      // Atualizar informações de debug
      setDebugInfo({
        mouseX: event.clientX,
        mouseY: event.clientY,
        relX,
        relY,
        distance,
        angle: angleInDegrees,
        adjustedAngle: clockwiseAngle * (180 / Math.PI),
        segmentIndex,
        rawMouseAngle: angle
      });
      
      // Verificar se o mouse está na área dos segmentos (entre o raio interno e externo)
      if (distance > innerDetectionRadius && distance < outerDetectionRadius) {
        if (prompts[segmentIndex]) {
          setSelectedSegment(segmentIndex);
        } else {
          setSelectedSegment(null);
        }
      } else {
        setSelectedSegment(null);
      }
    };
    
    const handleClick = (event: MouseEvent) => {
      event.preventDefault(); // Prevenir comportamento padrão
      event.stopPropagation(); // Impedir propagação
      
      if (selectedSegment !== null && prompts[selectedSegment]) {
        onSelect(prompts[selectedSegment].id);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [prompts, onSelect, onClose, selectedSegment, wheelPosition, calculatedValues]);

  const { centerX, centerY, wheelRadius, innerDetectionRadius, outerDetectionRadius, segmentAngle, segmentCount } = calculatedValues;

  return (
    <div 
      id="wheel-container"
      className="fixed inset-0 bg-black bg-opacity-30 select-none pointer-events-auto"
      onClick={(e) => e.preventDefault()} // Prevenir seleção de texto
      ref={containerRef}
    >
      {/* Debug Info - Informações de posicionamento */}
      <div className="fixed top-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50 font-mono">
        <div>Mouse Initial: x={mousePosition.x}, y={mousePosition.y}</div>
        <div>Wheel Position: x={wheelPosition.x}, y={wheelPosition.y}</div>
        <div>Wheel Size: {size.width}x{size.height}</div>
        <div>Center Offset: {centerX},{centerY}</div>
        <div>Detection Radii: {innerDetectionRadius.toFixed(0)}-{outerDetectionRadius.toFixed(0)}</div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div>Current Mouse: x={debugInfo.mouseX}, y={debugInfo.mouseY}</div>
          <div>Relative to Center: x={debugInfo.relX.toFixed(0)}, y={debugInfo.relY.toFixed(0)}</div>
          <div>Distance: {debugInfo.distance.toFixed(0)}px, Angle: {debugInfo.angle.toFixed(0)}°</div>
          <div>Adjusted Angle: {debugInfo.adjustedAngle.toFixed(0)}°, Segment: {debugInfo.segmentIndex}</div>
          <div>Selected Segment: {selectedSegment !== null ? selectedSegment : 'none'}</div>
        </div>
      </div>
      
      {/* Roda posicionada no mouse */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          width: size.width, 
          height: size.height,
          left: wheelPosition.x,
          top: wheelPosition.y
        }}
      >
        {/* Categoria Indicator */}
        <div className="absolute" style={{ top: -40, width: '100%' }}>
          <CategoryIndicator 
            categories={categories}
            currentCategoryId={currentCategoryId}
            onCategoryChange={onCategoryChange}
          />
        </div>
        
        {/* Visualização das áreas de detecção (para debug) */}
        <svg 
          width={size.width} 
          height={size.height} 
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          {/* Círculo interno de detecção */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={innerDetectionRadius} 
            fill="none" 
            stroke="rgba(255,0,0,0.3)" 
            strokeWidth="1" 
            strokeDasharray="5,5"
          />
          {/* Círculo externo de detecção */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={outerDetectionRadius} 
            fill="none" 
            stroke="rgba(255,0,0,0.3)" 
            strokeWidth="1" 
            strokeDasharray="5,5"
          />
          
          {/* Divisões dos segmentos */}
          {segments.map((segment, index) => (
            <line 
              key={`segment-line-${index}`}
              x1={centerX} 
              y1={centerY} 
              x2={centerX + Math.cos(segment.angle) * outerDetectionRadius}
              y2={centerY + Math.sin(segment.angle) * outerDetectionRadius}
              stroke="rgba(255,255,255,0.15)" 
              strokeWidth="1"
            />
          ))}
          
          {/* Linha de ângulo atual (para debug) - Apontando precisamente para a posição do mouse */}
          {debugInfo.distance > 0 && (
            <line 
              x1={centerX} 
              y1={centerY} 
              x2={centerX + debugInfo.relX * (outerDetectionRadius / debugInfo.distance)} 
              y2={centerY + debugInfo.relY * (outerDetectionRadius / debugInfo.distance)} 
              stroke="rgba(255,255,0,0.7)" 
              strokeWidth="2" 
            />
          )}
        </svg>
        
        {/* Center circle */}
        <div 
          className="absolute bg-black bg-opacity-70 rounded-full"
          style={{ 
            width: wheelRadius * 0.5, 
            height: wheelRadius * 0.5,
            left: centerX - (wheelRadius * 0.25), 
            top: centerY - (wheelRadius * 0.25)
          }}
        />
        
        {/* Wheel segments */}
        <svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
          {segments.map((segment) => {
            if (!segment.prompt) return null;
            
            // Coordenadas do arco interno
            const startX = centerX + wheelRadius * 0.4 * Math.cos(segment.startAngle);
            const startY = centerY + wheelRadius * 0.4 * Math.sin(segment.startAngle);
            const endX = centerX + wheelRadius * 0.4 * Math.cos(segment.endAngle);
            const endY = centerY + wheelRadius * 0.4 * Math.sin(segment.endAngle);
            
            // Coordenadas do arco externo
            const outerStartX = centerX + wheelRadius * 1.2 * Math.cos(segment.startAngle);
            const outerStartY = centerY + wheelRadius * 1.2 * Math.sin(segment.startAngle);
            const outerEndX = centerX + wheelRadius * 1.2 * Math.cos(segment.endAngle);
            const outerEndY = centerY + wheelRadius * 1.2 * Math.sin(segment.endAngle);
            
            const isSelected = selectedSegment === segment.index;
            
            // Dados do caminho para desenhar o segmento
            const pathData = `
              M ${startX} ${startY}
              A ${wheelRadius * 0.4} ${wheelRadius * 0.4} 0 0 1 ${endX} ${endY}
              L ${outerEndX} ${outerEndY}
              A ${wheelRadius * 1.2} ${wheelRadius * 1.2} 0 0 0 ${outerStartX} ${outerStartY}
              Z
            `;
            
            return (
              <g key={segment.index}>
                <path
                  d={pathData}
                  fill={isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'}
                  stroke={isSelected ? 'white' : 'rgba(255, 255, 255, 0.5)'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                
                {/* Icon position */}
                <g transform={`translate(${segment.x}, ${segment.y})`}>
                  <circle 
                    r={Math.max(wheelRadius * 0.1, 20)} 
                    fill={isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)'} 
                  />
                  <text 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="black"
                    fontSize={Math.max(wheelRadius * 0.07, 14)}
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {segment.prompt?.icon || segment.prompt?.content.substring(0, 2) || ''}
                  </text>
                </g>
                
                {/* Text label */}
                <text
                  x={centerX + (wheelRadius * 0.8) * Math.cos(segment.angle)}
                  y={centerY + (wheelRadius * 0.8) * Math.sin(segment.angle)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={isSelected ? Math.max(wheelRadius * 0.07, 14) : Math.max(wheelRadius * 0.06, 12)}
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {segment.prompt?.content.substring(0, 15) || ''}
                  {segment.prompt?.content.length > 15 ? '...' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
};

export default WheelComponent; 