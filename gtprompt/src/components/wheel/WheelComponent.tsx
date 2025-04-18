import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import CategoryIndicator from './CategoryIndicator';

/* ──────────── Tipos ──────────── */
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
  mousePosition: { x: number; y: number };
  showDebugInfo?: boolean;
}

/* ──────────── Prompts demo ──────────── */
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

/* ──────────── Componente ──────────── */
const WheelComponent: React.FC<WheelComponentProps> = ({ 
  prompts: providedPrompts, 
  categories, 
  currentCategoryId,
  onCategoryChange,
  onSelect, 
  onClose,
  mousePosition,
  showDebugInfo = false,
}) => {
  /* prompts (usa demo se não houver) */
  
  const prompts = useMemo(
    () =>
      providedPrompts && providedPrompts.length > 0
      ? providedPrompts 
        : DEMO_PROMPTS,
    [providedPrompts]
  );

  /* estados básicos */

  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [wheelPosition, setWheelPosition] = useState(mousePosition);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [debugInfo, setDebugInfo] = useState({ 
    mouseX: 0, 
    mouseY: 0, 
    relX: 0, 
    relY: 0, 
    distance: 0, 
    angle: 0, 
    segmentIndex: -1,
  });

  /* ──────────── Dimensões calculadas ──────────── */
  const calculatedValues = useMemo(() => {
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const wheelRadius = Math.min(size.width, size.height) * 0.4;
    const segmentCount = 8;
    const segmentAngle = (2 * Math.PI) / segmentCount;
    
    const innerDetectionRadius = wheelRadius * 0.15;
    const outerDetectionRadius = wheelRadius * 1.3;
    const freezeRadius = wheelRadius * 0.08; // evita saltos no miolo
    
    return {
      centerX,
      centerY,
      wheelRadius,
      segmentCount,
      segmentAngle,
      innerDetectionRadius,
      outerDetectionRadius,
      freezeRadius,
    };
  }, [size]);
  
  /* ──────────── Posiciona a roda uma vez ──────────── */
  useEffect(() => {
    const updateSizeAndPos = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const base = Math.min(Math.min(vw, vh) * 0.7, 500);

      setSize({ width: base, height: base });

      setWheelPosition({
        x: Math.min(Math.max(mousePosition.x, base / 2), vw - base / 2),
        y: Math.min(Math.max(mousePosition.y, base / 2), vh - base / 2),
      });
    };
    
    updateSizeAndPos();
    window.addEventListener('resize', updateSizeAndPos);
    return () => window.removeEventListener('resize', updateSizeAndPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // executa só na montagem

  /* ──────────── Segmentos (memo) ──────────── */
  const segments = useMemo(() => {
    const { centerX, centerY, wheelRadius, segmentCount, segmentAngle } =
      calculatedValues;
    
    return Array.from({ length: segmentCount }).map((_, index) => {
      const angle = Math.PI * 1.5 + index * segmentAngle; // 0° = topo
      const x = centerX + wheelRadius * Math.cos(angle);
      const y = centerY + wheelRadius * Math.sin(angle);
      
      return {
        index,
        x,
        y,
        angle,
        prompt: prompts[index] || null,
        startAngle: angle - segmentAngle / 2,
        endAngle: angle + segmentAngle / 2,
      };
    });
  }, [calculatedValues, prompts]);

  /* ──────────── Mouse move / click / esc ──────────── */
  useEffect(() => {
    // const {
    //   centerX,
    //   centerY,
    //   segmentCount,
    //   innerDetectionRadius,
    //   outerDetectionRadius,
    //   freezeRadius,
    // } = calculatedValues;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;                 // segurança
      const rect = containerRef.current.getBoundingClientRect();
    
      /* centro absoluto da roda, já com translate(-50%,-50%) aplicado */
      const centerAbsX = rect.left + calculatedValues.centerX;
      const centerAbsY = rect.top  + calculatedValues.centerY;
    
      const relX = e.clientX - centerAbsX;
      const relY = e.clientY - centerAbsY;
      const distance = Math.hypot(relX, relY);
    
      /* evita jitter dentro do miolo */
      if (distance < calculatedValues.freezeRadius) {
        setDebugInfo((d) => ({ ...d, mouseX: e.clientX, mouseY: e.clientY, relX, relY, distance }));
        return;
      }
    
      let angle = Math.atan2(relY, relX);
      if (angle < 0) angle += 2 * Math.PI;
      const angleFromTop = (angle + Math.PI / 2) % (2 * Math.PI);
    
      const segAngle = (2 * Math.PI) / calculatedValues.segmentCount;
      const segmentIndex = Math.round(angleFromTop / segAngle) % calculatedValues.segmentCount;
    
      if (
        distance > calculatedValues.innerDetectionRadius &&
        distance < calculatedValues.outerDetectionRadius &&
        prompts[segmentIndex]
      ) {
        setSelectedSegment(segmentIndex);
      } else {
        setSelectedSegment(null);
      }
    
      setDebugInfo({
        mouseX: e.clientX,
        mouseY: e.clientY,
        relX,
        relY,
        distance,
        angle: (angle * 180) / Math.PI,
        segmentIndex,
      });
    };
    

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (selectedSegment !== null) onSelect(prompts[selectedSegment].id);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    calculatedValues,
    wheelPosition.x,
    wheelPosition.y,
    prompts,
    onSelect,
    onClose,
    selectedSegment,
  ]);

  const {
    centerX,
    centerY,
    wheelRadius,
    innerDetectionRadius,
    outerDetectionRadius,
  } = calculatedValues;

  /* ──────────── CursorIndicator (linha) ──────────── */
  const CursorIndicator = () => {
    if (!containerRef.current) return null;
  
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = mousePosition.x - rect.left;  // já compensado
    const svgY = mousePosition.y - rect.top;
    
    return (
      <svg 
        width={size.width} 
        height={size.height} 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }}
      >
        <line x1={calculatedValues.centerX} y1={calculatedValues.centerY} x2={svgX} y2={svgY} stroke="#FD6649" strokeWidth="4" />
        <circle cx={svgX} cy={svgY} r="8" fill="#FD6649" stroke="#000000" strokeWidth="1" />
      </svg>
    );
  };


  /* ──────────── Render ──────────── */
  return (
    <div 
      id="wheel-container"
      className="fixed inset-0 bg-black bg-opacity-30 select-none pointer-events-auto"
    >
      {/* Debug overlay - Renderiza condicionalmente */}
      {showDebugInfo && (
        <div className="fixed top-0 left-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50 font-mono pointer-events-none">
        <div>Mouse Initial: x={mousePosition.x}, y={mousePosition.y}</div>
          <div>Wheel Position: x={wheelPosition.x.toFixed(0)}, y={wheelPosition.y.toFixed(0)}</div>
          <div>Wheel Size: {size.width.toFixed(0)}×{size.height.toFixed(0)}</div>
          <div>Rel Center: x={debugInfo.relX.toFixed(0)}, y={debugInfo.relY.toFixed(0)}</div>
          <div>Distance: {debugInfo.distance.toFixed(0)}px</div>
          <div>Angle: {debugInfo.angle.toFixed(0)}°, Segment: {debugInfo.segmentIndex}</div>
          <div>Selected Segment: {selectedSegment ?? 'none'}</div>
        </div>
      )}
      
      {/* Roda */}
      <motion.div 
        ref={containerRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          width: size.width, 
          height: size.height,
          left: wheelPosition.x,
          top: wheelPosition.y,
        }}
      >
        {/* Círculos de detecção e divisões (debug visual) - Renderiza condicionalmente */}
        {showDebugInfo && (
        <svg 
          width={size.width} 
          height={size.height} 
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={innerDetectionRadius} 
            fill="none" 
            stroke="#757575" 
            strokeWidth="1" 
            strokeDasharray="4,4"
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={outerDetectionRadius} 
            fill="none" 
            stroke="#757575" 
            strokeWidth="1" 
            strokeDasharray="4,4"
          />
            {segments.map((seg) => (
            <line 
                key={seg.index}
              x1={centerX} 
              y1={centerY} 
                x2={centerX + Math.cos(seg.angle) * outerDetectionRadius}
                y2={centerY + Math.sin(seg.angle) * outerDetectionRadius}
              stroke="#303030" 
              strokeWidth="1"
            />
          ))}
            {selectedSegment !== null && (
                <line 
                  x1={centerX} 
                  y1={centerY} 
                x2={
                  centerX +
                  Math.cos(segments[selectedSegment].angle) * outerDetectionRadius
                }
                y2={
                  centerY +
                  Math.sin(segments[selectedSegment].angle) * outerDetectionRadius
                }
                  stroke="#FD6649" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                />
              )}
          </svg>
          )}
        
        {/* Círculo central escuro */}
        <div 
          className="absolute rounded-full"
          style={{ 
            width: wheelRadius * 0.5, 
            height: wheelRadius * 0.5,
            left: centerX - wheelRadius * 0.25,
            top: centerY - wheelRadius * 0.25,
            backgroundColor: "#101010"
          }}
        />

        {/* Segmentos */}
        <svg width={size.width} height={size.height}>
          {segments.map((seg) => {
            if (!seg.prompt) return null;

            const path = `
              M ${centerX + wheelRadius * 0.4 * Math.cos(seg.startAngle)}
                ${centerY + wheelRadius * 0.4 * Math.sin(seg.startAngle)}
              A ${wheelRadius * 0.4} ${wheelRadius * 0.4} 0 0 1
                ${centerX + wheelRadius * 0.4 * Math.cos(seg.endAngle)}
                ${centerY + wheelRadius * 0.4 * Math.sin(seg.endAngle)}
              L ${centerX + wheelRadius * 1.2 * Math.cos(seg.endAngle)}
                ${centerY + wheelRadius * 1.2 * Math.sin(seg.endAngle)}
              A ${wheelRadius * 1.2} ${wheelRadius * 1.2} 0 0 0
                ${centerX + wheelRadius * 1.2 * Math.cos(seg.startAngle)}
                ${centerY + wheelRadius * 1.2 * Math.sin(seg.startAngle)}
              Z
            `;

            const isSel = selectedSegment === seg.index;
            
            return (
              <g key={seg.index}>
                <path
                  d={path}
                  fill={isSel ? '#303030' : '#202020'}
                  stroke={isSel ? '#FD6649' : '#404040'}
                  strokeWidth={isSel ? 2 : 1}
                />
                {/* ícone */}
                <g transform={`translate(${seg.x}, ${seg.y})`}>
                  <circle 
                    r={Math.max(wheelRadius * 0.1, 20)} 
                    fill={isSel ? '#FD6649' : '#404040'}
                  />
                  <text 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#FFFFFF"
                    fontSize={Math.max(Math.floor(wheelRadius * 0.07 / 4) * 4, 16)}
                    fontWeight={isSel ? 'bold' : 'normal'}
                  >
                    {seg.prompt.icon ||
                      seg.prompt.content.substring(0, 2).toUpperCase()}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        
        {/* Texto flutuante do prompt selecionado - posição ajustada baseada na borda da tela */}
        {selectedSegment !== null && segments[selectedSegment]?.prompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
            style={{
              ...(function() {
                // Detectar proximidade com bordas da tela
                const viewportWidth = window.innerWidth;
                const wheelCenterX = wheelPosition.x;
                const offset = wheelRadius * 1.3; // Distância consistente do centro
                
                // Se a roda estiver próxima da borda direita, posicione o texto à esquerda
                if (wheelCenterX > viewportWidth - size.width / 2 - 100) {
                  return {
                    right: 'auto',
                    left: centerX - offset,
                    transform: 'translateY(-50%) translateX(-100%)'
                  };
                } 
                // Se a roda estiver próxima da borda esquerda, posicione o texto à direita
                else if (wheelCenterX < size.width / 2 + 100) {
                  return {
                    left: 'auto',
                    right: size.width - centerX - offset,
                    transform: 'translateY(-50%) translateX(100%)'
                  };
                }
                // Caso contrário, use a posição baseada no ângulo do segmento
                else {
                  const angle = segments[selectedSegment].angle;
                  // Simplificar para usar diretamente o ângulo em graus
                  const angleDegrees = (angle * 180 / Math.PI) % 360;
                  
                  // Dividir em quadrantes de forma simétrica (esquerda/direita)
                  if (angleDegrees > 270 || angleDegrees < 90) {
                    return {
                      right: 'auto',
                      left: centerX - offset,
                      transform: 'translateY(-50%) translateX(-100%)'
                    };
                  } else {
                    return {
                      left: 'auto',
                      right: size.width - centerX - offset,
                      transform: 'translateY(-50%) translateX(100%)'
                    };
                  }
                }
              })(),
              top: centerY,
              zIndex: 10,
              maxWidth: wheelRadius * 2
            }}
          >
            <div
              style={{
                backgroundColor: '#FD6649',
                padding: '8px 16px',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: Math.max(Math.floor(wheelRadius * 0.07 / 4) * 4, 16),
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              {segments[selectedSegment].prompt.content}
            </div>
          </motion.div>
        )}
        
        {/* linha indicadora - Renderiza condicionalmente */}
        {showDebugInfo && <CursorIndicator />}
      </motion.div>
    </div>
  );
};

export default WheelComponent;
