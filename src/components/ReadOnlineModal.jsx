// components/ReadOnlineModal.jsx
import React, { useState, useEffect, useRef } from 'react';

const ReadOnlineModal = ({ buttonText = "Read Online", buttonVariant = "outline" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookHtml, setBookHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(100); // percentage
  const contentRef = useRef(null);

  const loadBookContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/TheVoyagesofVictora.html');
      
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
      }
      
      let html = await response.text();
      
      const styleTag = `
        <style>
          * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          body {
            background: #fef9e6 !important;
            color: #2c1810 !important;
            font-family: Georgia, "Times New Roman", serif !important;
            line-height: 1.8 !important;
            font-size: ${fontSize}% !important;
            padding: 20px !important;
            margin: 0 !important;
            overflow-x: hidden !important;
          }
          .c0, .c1, p, div:not(.modal-container) {
            font-family: Georgia, "Times New Roman", serif !important;
            font-size: 1rem !important;
            line-height: 1.8 !important;
            color: #2c1810 !important;
            word-wrap: break-word !important;
          }
          .c3.title, .c7.title {
            color: #20c997 !important;
            font-family: 'Cinzel Decorative', Georgia, serif !important;
            text-align: center !important;
            margin: 30px 0 20px 0 !important;
            font-size: 28px !important;
          }
          .c8 {
            font-size: 28px !important;
          }
          .c5 {
            font-style: italic !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 20px auto !important;
          }
          .c1 {
            text-align: justify !important;
            margin-bottom: 1em !important;
          }
          .c6, .c14 {
            margin-bottom: 0.5em !important;
          }
          h1, h2, .title {
            color: #20c997 !important;
            border-bottom: 2px solid #20c997 !important;
            padding-bottom: 10px !important;
            margin-top: 40px !important;
          }
          @media (max-width: 768px) {
            body {
              font-size: 90% !important;
              padding: 15px !important;
            }
            .c3.title {
              font-size: 22px !important;
            }
          }
          @media (max-width: 480px) {
            body {
              font-size: 85% !important;
              padding: 10px !important;
            }
            .c3.title {
              font-size: 18px !important;
            }
          }
        </style>
      `;
      
      html = html.replace('</head>', `${styleTag}</head>`);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body.innerHTML;
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
            ${styleTag}
          </head>
          <body>
            ${bodyContent}
          </body>
        </html>
      `;
      
      setBookHtml(fullHtml);
    } catch (err) {
      console.error('Error loading book:', err);
      setError('Unable to load the book content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    if (!bookHtml && !isLoading) {
      loadBookContent();
    }
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  const increaseFont = () => {
    setFontSize(prev => Math.min(prev + 10, 150));
  };

  const decreaseFont = () => {
    setFontSize(prev => Math.max(prev - 10, 70));
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`btn ${buttonVariant === 'outline' ? 'btn-outline' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '12px 20px',
          background: buttonVariant === 'outline' ? 'transparent' : 'linear-gradient(135deg, #20c997 0%, #1e90ff 100%)',
          border: buttonVariant === 'outline' ? '2px solid #20c997' : 'none',
          color: buttonVariant === 'outline' ? '#20c997' : 'white',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontFamily: 'var(--font-accent, "Crimson Text", Georgia, serif)',
          margin: '0.5rem',
          fontSize: 'clamp(0.875rem, 4vw, 1rem)',
          minHeight: '44px'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onMouseEnter={(e) => {
          if (buttonVariant === 'outline') {
            e.currentTarget.style.background = 'rgba(32, 201, 151, 0.1)';
          } else {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonVariant === 'outline') {
            e.currentTarget.style.background = 'transparent';
          } else {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }
        }}
      >
        📖 {buttonText}
      </button>

      {isOpen && (
        <div
          className="modal-overlay"
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            padding: '0',
            margin: '0'
          }}
        >
          <div
            className="modal-container"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a2e',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: 'none',
              borderRadius: '0'
            }}
          >
            {/* Modal Header - Fixed at top */}
            <div
              className="modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#1a1a2e',
                borderBottom: '2px solid #20c997',
                flexWrap: 'wrap',
                gap: '10px',
                flexShrink: 0,
                zIndex: 10
              }}
            >
              <h2 style={{
                margin: 0,
                color: '#20c997',
                fontFamily: 'var(--font-heading, "Cinzel Decorative", Georgia, serif)',
                fontSize: 'clamp(0.85rem, 4vw, 1.1rem)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚓</span> 
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  The Voyages of Victora
                </span>
              </h2>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {/* Font size controls */}
                {/* <button
                  onClick={decreaseFont}
                  style={{
                    background: 'rgba(32, 201, 151, 0.2)',
                    border: '1px solid #20c997',
                    color: '#20c997',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
                    fontFamily: 'var(--font-body, "Inter", sans-serif)',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                  aria-label="Decrease font size"
                  onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  A-
                </button>
                <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{fontSize}%</span>
                <button
                  onClick={increaseFont}
                  style={{
                    background: 'rgba(32, 201, 151, 0.2)',
                    border: '1px solid #20c997',
                    color: '#20c997',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
                    fontFamily: 'var(--font-body, "Inter", sans-serif)',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                  aria-label="Increase font size"
                  onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  A+
                </button>
                 */}
                <button
                  onClick={() => {
                    if (contentRef.current) {
                      const iframe = contentRef.current.querySelector('iframe');
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  style={{
                    background: 'rgba(32, 201, 151, 0.2)',
                    border: '1px solid #20c997',
                    color: '#20c997',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
                    fontFamily: 'var(--font-body, "Inter", sans-serif)',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                  aria-label="Scroll to top"
                >
                  ⬆️
                </button>
                
                <button
                  onClick={closeModal}
                  style={{
                    background: 'rgba(255, 107, 107, 0.2)',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.7rem, 3vw, 0.8rem)',
                    fontFamily: 'monospace',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    minHeight: '40px',
                    fontWeight: 'bold'
                  }}
                  aria-label="Close modal"
                  onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable Book Area */}
            <div
              ref={contentRef}
              className="modal-content"
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#fef9e6',
                position: 'relative',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: '1rem',
                  padding: '2rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e0d5c0',
                    borderTop: '4px solid #20c997',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ color: '#666', fontFamily: 'Georgia, serif' }}>Loading the adventure...</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : error ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</span>
                  <h3 style={{ color: '#c0392b', marginBottom: '0.5rem' }}>Unable to Load Book</h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
                  <button
                    onClick={loadBookContent}
                    style={{
                      padding: '12px 24px',
                      background: '#20c997',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      minHeight: '44px'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <iframe
                  key={fontSize}
                  srcDoc={bookHtml}
                  title="The Voyages of Victora"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#fef9e6',
                    display: 'block'
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                />
              )}
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div
              className="modal-footer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                backgroundColor: '#1a1a2e',
                borderTop: '1px solid #20c997',
                fontSize: 'clamp(0.65rem, 3vw, 0.75rem)',
                color: '#aaa',
                fontFamily: 'var(--font-body, "Inter", sans-serif)',
                flexWrap: 'wrap',
                gap: '8px',
                flexShrink: 0,
                zIndex: 10
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                🏴‍☠️ Volume One
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✍️ Christopher Feveck
              </span>
              <button
                onClick={() => {
                  const printWindow = window.open();
                  printWindow.document.write(bookHtml);
                  printWindow.document.close();
                  printWindow.print();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#20c997',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.65rem, 3vw, 0.75rem)',
                  textDecoration: 'underline',
                  padding: '8px 12px',
                  minHeight: '40px'
                }}
                aria-label="Print book"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadOnlineModal;