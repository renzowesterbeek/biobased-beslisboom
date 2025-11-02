import React, { useMemo, useState } from 'react';
import { DecisionFlowDefinition, DecisionNode } from '../types';

export function DecisionFlow({ definition }: { definition: DecisionFlowDefinition }): JSX.Element {
  const idToNode = useMemo(() => {
    const map = new Map<string, DecisionNode>();
    for (const n of definition.nodes) map.set(n.id, n);
    return map;
  }, [definition]);

  const tooltipMap = useMemo(() => {
    const map = new Map<string, string>();
    if (definition.tooltips) {
      for (const tip of definition.tooltips) {
        map.set(tip.term.toLowerCase(), tip.explanation);
      }
    }
    return map;
  }, [definition.tooltips]);

  const [currentId, setCurrentId] = useState<string>(definition.startId);
  const [result, setResult] = useState<string | null>(null);
  const [resultNodeId, setResultNodeId] = useState<string | null>(null);
  const [resultOptionIndex, setResultOptionIndex] = useState<number | null>(null);
  const [path, setPath] = useState<string[]>([definition.startId]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const current = idToNode.get(currentId);

  if (!current) {
    return <div style={{ color: '#04452e' }}>Onbekende stap: {currentId}</div>;
  }

  function handleChoose(optionIndex: number) {
    const currentNode = idToNode.get(currentId);
    if (!currentNode) return;
    const option = currentNode.options[optionIndex];
    if (!option) return;
    if (option.result) {
      setIsTransitioning(true);
      setTimeout(() => {
        setResult(option.result || null);
        setResultNodeId(currentId);
        setResultOptionIndex(optionIndex);
        setIsTransitioning(false);
      }, 300);
      return;
    }
    if (option.nextId) {
      const nextId = option.nextId;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentId(nextId);
        setPath(prev => [...prev, nextId]);
        setAnimationKey(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
      return;
    }
  }

  function handleBack() {
    if (path.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const newPath = [...path];
      newPath.pop();
      const previousId = newPath[newPath.length - 1];
      if (previousId) {
        setCurrentId(previousId);
        setPath(newPath);
        setAnimationKey(prev => prev + 1);
        setIsTransitioning(false);
      }
    }, 300);
  }

  function handleRestart() {
    setIsTransitioning(true);
    setTimeout(() => {
      setResult(null);
      setResultNodeId(null);
      setResultOptionIndex(null);
      setCurrentId(definition.startId);
      setPath([definition.startId]);
      setAnimationKey(prev => prev + 1);
      setIsTransitioning(false);
      setShareCopied(false);
    }, 300);
  }

  function handleShowBiobasedAlternative() {
    if (resultNodeId && resultOptionIndex !== null) {
      const node = idToNode.get(resultNodeId);
      if (node) {
        const selectedOption = node.options[resultOptionIndex];
        if (selectedOption.card && selectedOption.card.biobasedAlternativeIndex !== undefined) {
          setIsTransitioning(true);
          setTimeout(() => {
            setResult(null);
            setResultNodeId(null);
            setResultOptionIndex(null);
            setCurrentId(resultNodeId);
            setPath(prev => {
              const index = prev.indexOf(resultNodeId);
              return index >= 0 ? prev.slice(0, index + 1) : [...prev, resultNodeId];
            });
            setAnimationKey(prev => prev + 1);
            setIsTransitioning(false);
            
            // Scroll to biobased alternative after render
            setTimeout(() => {
              const targetElement = document.querySelector(`[data-option-index="${selectedOption.card!.biobasedAlternativeIndex}"]`) as HTMLElement;
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.style.transition = 'box-shadow 0.3s ease';
                targetElement.style.boxShadow = '0 0 0 4px rgba(4, 69, 46, 0.3)';
                setTimeout(() => {
                  targetElement.style.boxShadow = '';
                  setTimeout(() => {
                    targetElement.style.transition = '';
                  }, 300);
                }, 2000);
              }
            }, 100);
          }, 300);
        }
      }
    }
  }

  function handleShare() {
    if (!result) return;
    
    const textToShare = `${definition.title || 'Beslisboom Resultaat'}\n\n${result}\n\n${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: definition.title || 'Beslisboom Resultaat',
        text: result,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard if share fails
        copyToClipboard(textToShare);
      });
    } else {
      copyToClipboard(textToShare);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    });
  }

  function renderWithTooltips(text: string): React.ReactNode {
    if (!text) return text;
    
    // Split by word boundaries to match whole words only
    const regex = /(\b\w+\b|\s+|.)/g;
    const parts: React.ReactNode[] = [];
    let match;
    let keyIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      const segment = match[0];
      const cleanSegment = segment.trim().toLowerCase();
      
      // Check if this segment matches a tooltip term (whole word match)
      if (cleanSegment && tooltipMap.has(cleanSegment)) {
        parts.push(
          <span
            key={`tooltip-${keyIndex++}`}
            style={{
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textDecorationColor: '#04452e',
              textUnderlineOffset: '3px',
              cursor: 'help',
              position: 'relative',
              display: 'inline'
            }}
            onMouseEnter={(e) => {
              setHoveredTooltip(cleanSegment);
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
              });
            }}
            onMouseLeave={() => {
              setHoveredTooltip(null);
              setTooltipPosition(null);
            }}
          >
            {segment}
          </span>
        );
      } else {
        parts.push(<span key={`text-${keyIndex++}`}>{segment}</span>);
      }
    }
    
    return <>{parts}</>;
  }

  const isStartNode = currentId === definition.startId;
  const canGoBack = path.length > 1;
  const progressSteps = path.length;
  const maxDepth = 10;

  // Check if the selected option has a biobased alternative
  const hasBiobasedAlternative = (() => {
    if (resultNodeId && resultOptionIndex !== null) {
      const node = idToNode.get(resultNodeId);
      if (node) {
        const selectedOption = node.options[resultOptionIndex];
        return selectedOption?.card?.biobasedAlternativeIndex !== undefined;
      }
    }
    return false;
  })();

  if (result) {
    return (
      <div
        key={animationKey}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 0.4s ease, transform 0.4s ease'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #04452e 0%, #066a45 100%)',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: 32,
          boxShadow: '0 8px 24px rgba(4, 69, 46, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#ffffff', 
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '-0.5px'
            }}>
              Uw Advies
            </h2>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✓
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: '#ffffff',
          border: '2px solid #daf7e0',
          padding: '40px', 
          borderRadius: '12px', 
          color: '#04452e', 
          marginBottom: 32,
          whiteSpace: 'pre-line',
          lineHeight: 1.9,
          fontSize: '17px',
          boxShadow: '0 4px 12px rgba(4, 69, 46, 0.08)'
        }}>
          <div style={{
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: '2px solid #daf7e0'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#04452e',
              fontSize: '22px',
              fontWeight: 600
            }}>
              {result.split('\n')[0]}
            </h3>
          </div>
          <div style={{ color: '#2d4a3e', fontSize: '16px' }}>
            {renderWithTooltips(result.split('\n').slice(2).join('\n'))}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #daf7e0 0%, #f0f9f4 100%)',
          border: '2px solid #04452e',
          padding: '32px',
          borderRadius: '12px',
          marginBottom: 32,
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#04452e',
            fontSize: '20px',
            fontWeight: 600
          }}>
            Wilt u hulp bij uw verduurzaming?
          </h3>
          <p style={{
            margin: '0 0 24px 0',
            color: '#2d4a3e',
            fontSize: '16px',
            lineHeight: 1.6
          }}>
            Creative City Solutions biedt volledig gesubsidieerde procesbegeleiding voor de verduurzaming van VvE's
          </p>
          <a
            href="https://www.creativecitysolutions.com/afspraak"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              borderRadius: '8px',
              border: 'none',
              background: '#04452e',
              color: '#ffffff',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '17px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(4, 69, 46, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#066a45';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(4, 69, 46, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#04452e';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 69, 46, 0.2)';
            }}
          >
            Maak een afspraak →
          </a>
        </div>

        {hasBiobasedAlternative && (
          <div style={{
            background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
            border: '2px solid #fdd835',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: 24,
            textAlign: 'center'
          }}>
            <p style={{
              margin: '0 0 16px 0',
              color: '#04452e',
              fontSize: '16px',
              fontWeight: 500
            }}>
              Wilt u een milieuvriendelijker alternatief bekijken?
            </p>
            <button
              onClick={handleShowBiobasedAlternative}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                border: '2px solid #04452e',
                background: '#ffffff',
                color: '#04452e',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '15px',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#daf7e0';
                e.currentTarget.style.borderColor = '#04452e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#04452e';
              }}
            >
              🌱 Bekijk milieuvriendelijk alternatief
            </button>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleShare}
            style={{ 
              flex: 1,
              minWidth: '200px',
              padding: '16px 32px',
              borderRadius: '8px',
              border: '2px solid #04452e',
              background: shareCopied ? '#daf7e0' : '#ffffff',
              color: '#04452e',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { 
              if (!shareCopied) {
                e.currentTarget.style.background = '#daf7e0';
                e.currentTarget.style.borderColor = '#04452e';
              }
            }}
            onMouseLeave={(e) => { 
              if (!shareCopied) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#04452e';
              }
            }}
          >
            {shareCopied ? (
              <>
                <span>✓</span>
                <span>Gekopieerd!</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Delen</span>
              </>
            )}
          </button>
          <button 
            onClick={handleRestart} 
            style={{ 
              flex: 1,
              minWidth: '200px',
              padding: '16px 32px',
              borderRadius: '8px',
              border: 'none',
              background: '#04452e',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = '#066a45';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 69, 46, 0.3)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = '#04452e';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Opnieuw beginnen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress indicator and back button */}
      {!isStartNode && (
        <div style={{ 
          marginBottom: 32, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16
        }}>
          {canGoBack && (
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #daf7e0',
                background: '#ffffff',
                color: '#04452e',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = '#daf7e0';
                e.currentTarget.style.borderColor = '#04452e';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#daf7e0';
              }}
            >
              ← Terug
            </button>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            opacity: 0.6,
            fontSize: '14px',
            flex: 1
          }}>
            <div style={{ 
              height: '2px', 
              flex: 1, 
              background: '#daf7e0', 
              borderRadius: '1px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((progressSteps / maxDepth) * 100, 100)}%`,
                background: '#04452e',
                transition: 'width 0.3s ease',
                borderRadius: '1px'
              }} />
            </div>
            <span style={{ color: '#04452e', minWidth: '60px', textAlign: 'right' }}>
              Stap {progressSteps}
            </span>
          </div>
        </div>
      )}

      <div
        key={animationKey}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
      >
        {current.title && (
          <h2 style={{ 
            marginTop: 0, 
            marginBottom: 32, 
            color: '#04452e',
            animation: isTransitioning ? 'none' : 'fadeInSlide 0.4s ease-out'
          }}>
            {renderWithTooltips(current.title)}
          </h2>
        )}
        {current.question && (
          <p style={{ 
            marginTop: 0, 
            marginBottom: current.note ? 16 : 32, 
            color: '#04452e', 
            lineHeight: 1.6,
            animation: isTransitioning ? 'none' : 'fadeInSlide 0.5s ease-out',
            whiteSpace: 'pre-line'
          }}>
            {renderWithTooltips(current.question)}
          </p>
        )}
        {current.note && (
          <div style={{
            marginTop: 0,
            marginBottom: 32,
            padding: '12px 16px',
            background: '#f0f9f4',
            borderLeft: '3px solid #04452e',
            borderRadius: 4,
            fontSize: '14px',
            color: '#04452e',
            lineHeight: 1.6
          }}>
            <strong>Let op:</strong> {current.note}
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 20, 
          marginTop: 0 
        }}>
          {current.options.map((opt, idx) => (
            <div key={`${currentId}-${idx}`} data-option-index={idx} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => handleChoose(idx)}
                style={{
                  textAlign: 'left',
                  padding: '16px 20px',
                  borderRadius: 8,
                  border: isStartNode ? 'none' : '1px solid #daf7e0',
                  background: isStartNode ? '#04452e' : '#ffffff',
                  color: isStartNode ? '#daf7e0' : '#04452e',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '17px',
                  fontWeight: 500,
                  animation: isTransitioning ? 'none' : `fadeInSlide ${(0.5 + idx * 0.1).toFixed(1)}s ease-out`,
                  animationFillMode: 'both',
                  width: '100%'
                }}
                onMouseEnter={(e) => { 
                  if (!isStartNode) {
                    e.currentTarget.style.background = '#daf7e0';
                    e.currentTarget.style.borderColor = '#04452e';
                  } else {
                    e.currentTarget.style.background = '#daf7e0';
                    e.currentTarget.style.color = '#04452e';
                    e.currentTarget.style.border = '1px solid #04452e';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!isStartNode) {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = '#daf7e0';
                  } else {
                    e.currentTarget.style.background = '#04452e';
                    e.currentTarget.style.color = '#daf7e0';
                    e.currentTarget.style.border = 'none';
                  }
                }}
              >
                {opt.label}
              </button>
              {opt.card && (
                <div style={{
                  padding: '20px',
                  background: '#fff8e1',
                  border: '1px solid #fdd835',
                  borderRadius: 8,
                  marginLeft: 0,
                  animation: isTransitioning ? 'none' : `fadeInSlide ${(0.6 + idx * 0.1).toFixed(1)}s ease-out`,
                  animationFillMode: 'both'
                }}>
                  {opt.card.price && (
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#04452e',
                      marginBottom: 16
                    }}>
                      {opt.card.price}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {opt.card.pros && opt.card.pros.length > 0 && (
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#04452e',
                          marginBottom: 8
                        }}>
                          Voordelen:
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: 20,
                          color: '#04452e',
                          lineHeight: 1.8
                        }}>
                          {opt.card.pros.map((pro, i) => (
                            <li key={i}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {opt.card.cons && opt.card.cons.length > 0 && (
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#04452e',
                          marginBottom: 8
                        }}>
                          Nadelen:
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: 20,
                          color: '#04452e',
                          lineHeight: 1.8
                        }}>
                          {opt.card.cons.map((con, i) => (
                            <li key={i}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {opt.card.description && (
                    <div style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid #fdd835',
                      color: '#04452e',
                      lineHeight: 1.6,
                      fontSize: '14px'
                    }}>
                      {opt.card.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip overlay */}
      {hoveredTooltip && tooltipPosition && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)',
            background: '#04452e',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: '14px',
            maxWidth: '300px',
            zIndex: 1000,
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            lineHeight: 1.5
          }}
        >
          {tooltipMap.get(hoveredTooltip)}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #04452e'
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}