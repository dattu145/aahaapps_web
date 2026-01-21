import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CardButton = ({ btn, isPopup }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, shiftX: 0 });
    const popupRef = useRef(null);
    const btnRef = useRef(null);

    // Update position when opening
    const updatePosition = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;

            // Smart Positioning Logic
            const btnCenter = rect.left + rect.width / 2;
            const popupWidth = 280; // slightly larger than w-64 (256px) for safety
            const screenWidth = window.innerWidth;
            const padding = 16; // Maintain 16px gap from screen edges

            let shift = 0;

            // Check if popup goes off right edge
            if (btnCenter + popupWidth / 2 > screenWidth - padding) {
                shift = (screenWidth - padding) - (btnCenter + popupWidth / 2);
            }
            // Check if popup goes off left edge
            else if (btnCenter - popupWidth / 2 < padding) {
                shift = padding - (btnCenter - popupWidth / 2);
            }

            setCoords({
                top: rect.top + scrollY - 12, // Move up by 12px for spacing
                left: rect.left + scrollX + rect.width / 2,
                shiftX: shift
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                btnRef.current &&
                !btnRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const btnStyle = {
        ...(btn.bg_color ? { backgroundColor: btn.bg_color, color: btn.text_color } : {}),
        fontSize: `${btn.font_size || 15}px`
    };

    if (isPopup) {
        return (
            <div className="relative w-full h-full">
                <button
                    ref={btnRef}
                    onClick={handleToggle}
                    className="w-full h-full px-4 py-2.5 rounded-lg font-bold shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer bg-[#1a1f2e] text-white hover:bg-black flex items-center justify-center"
                    style={btnStyle}
                >
                    {btn.text}
                </button>

                {/* Portal Popup - Smart Positioned */}
                {isOpen && createPortal(
                    <div
                        className="absolute z-[9999]"
                        style={{
                            top: coords.top,
                            left: coords.left,
                        }}
                    >
                        {/* Wrapper handles centering + shift to stay on screen */}
                        {/* Fix: transform combines both X and Y translation */}
                        <div
                            ref={popupRef}
                            className="relative"
                            style={{
                                transform: `translate(calc(-50% + ${coords.shiftX}px), -100%)`
                            }}
                        >
                            <div className="w-64 p-4 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 text-center animate-fade-in-up relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                    }}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-black p-1 bg-white rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={16} />
                                </button>
                                <div
                                    className="text-sm text-gray-700 leading-relaxed font-normal prose prose-sm max-w-none mt-2 max-h-[60vh] overflow-y-auto custom-scrollbar"
                                    dangerouslySetInnerHTML={{ __html: btn.popup_content }}
                                />
                                {/* Arrow - Counter-shifted to stay pointing at button */}
                                <div
                                    className="absolute -bottom-2 left-1/2 w-4 h-4 bg-white border-b border-r border-gray-100"
                                    style={{
                                        marginLeft: '-8px', // Center 16px element
                                        transform: `translateX(${-coords.shiftX}px) rotate(45deg)`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    return (
        <a
            href={btn.link}
            target="_blank"
            className="w-full h-full px-4 py-2.5 rounded-lg font-bold shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center bg-[#1a1f2e] text-white hover:bg-black"
            style={btnStyle}
        >
            {btn.text}
        </a>
    );
};

const ExpandableDescription = ({ content, textColor, isExpanded, onToggle }) => {
    const textRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (textRef.current) {
                setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight + 1);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [content, isExpanded]);

    return (
        <div className="flex flex-col items-start mb-4">
            <div
                ref={textRef}
                className={`text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none [&>*:last-child]:mb-0`}
                style={{
                    color: textColor,
                    ...(!isExpanded ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    } : {})
                }}
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {(isOverflowing || isExpanded) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className="mt-1 text-blue-600 font-medium text-sm hover:underline focus:outline-none"
                >
                    {isExpanded ? 'Show Less' : 'Read More...'}
                </button>
            )}
        </div>
    );
};

const PublicCard = ({ card, index = 0 }) => {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const section1Images = typeof card.section1_images === 'string'
        ? JSON.parse(card.section1_images)
        : (card.section1_images || []);

    const buttons = typeof card.buttons === 'string'
        ? JSON.parse(card.buttons)
        : (card.buttons || []);

    const validThumbnails = section1Images.filter(img => img && typeof img === 'string' && img.trim().length > 0);
    const hasThumbnails = validThumbnails.length > 0;

    const title = card.title ? String(card.title).trim() : '';
    const description = card.description ? String(card.description).trim() : '';

    const hasContent = title.length > 0 || description.length > 0 || buttons.length > 0;

    const isOnlyMainImage = !hasThumbnails && !hasContent && !!card.section2_image;

    const delay = `${index * 150}ms`;

    const openGallery = (index) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % section1Images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + section1Images.length) % section1Images.length);
    };

    return (
        <>
            <div
                className="w-full max-w-6xl mx-auto mb-12 md:mb-24 rounded-3xl overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-0 animate-fade-in-up bg-white"
                style={{
                    '--card-bg': card.card_bg_color || '#ffffff',
                    animationDelay: delay
                }}
            >
                {/* Desktop Layout: 3 Columns Grid */}
                <div className={`hidden lg:grid lg:grid-cols-12 gap-0 transition-all duration-500 ease-in-out ${isExpanded ? 'min-h-[500px] h-auto' : 'h-[500px]'}`}>

                    {/* Col 1: Vertical Thumbnails Scroll */}
                    {!isOnlyMainImage && (
                        <div className="col-span-2 border-r border-gray-100 overflow-y-auto no-scrollbar p-3 space-y-3 bg-white">
                            {section1Images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => openGallery(idx)}
                                    className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition border border-transparent hover:border-blue-500 shadow-sm"
                                >
                                    <img src={`/${img}`} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Col 2: Main Image */}
                    <div className={`${isOnlyMainImage ? 'col-span-12' : 'col-span-6'} relative group overflow-hidden bg-gray-50 flex items-center justify-center p-4`}>
                        {card.section2_image ? (
                            <img
                                src={`/${card.section2_image}`}
                                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                alt={card.title}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">No Main Image</div>
                        )}
                    </div>

                    {/* Col 3: Content */}
                    {!isOnlyMainImage && (
                        <div
                            className="col-span-4 p-10 flex flex-col justify-center relative overflow-hidden bg-white"
                            style={{ backgroundColor: card.card_bg_color }}
                        >
                            <h2
                                className="text-3xl font-bold mb-4 leading-tight tracking-tight text-gray-900"
                                style={{ color: card.title_color }}
                            >
                                {card.title}
                            </h2>
                            <ExpandableDescription
                                content={card.description}
                                textColor={card.desc_color}
                                isExpanded={isExpanded}
                                onToggle={() => setIsExpanded(!isExpanded)}
                            />

                            <div className="grid grid-cols-2 gap-3 mt-4 w-full [&>*:nth-child(odd):last-child]:col-span-2">
                                {buttons.map((btn, i) => (
                                    <CardButton key={i} btn={btn} isPopup={btn.type === 'popup'} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden flex flex-col bg-white">
                    {/* 1. Horizontal Thumbnails */}
                    <div className="flex overflow-x-auto p-4 gap-3 no-scrollbar border-b border-gray-100">
                        {section1Images.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => openGallery(idx)}
                                className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden cursor-pointer border border-gray-200 shadow-sm"
                            >
                                <img src={`/${img}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* 2. Main Image */}
                    <div className="aspect-video w-full bg-gray-50 relative p-2">
                        {card.section2_image && (
                            <img src={`/${card.section2_image}`} className="w-full h-full object-contain" />
                        )}
                    </div>

                    {/* 3. Content */}
                    <div className="p-6 bg-white" style={{ backgroundColor: card.card_bg_color }}>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900" style={{ color: card.title_color }}>{card.title}</h2>
                        <ExpandableDescription
                            content={card.description}
                            textColor={card.desc_color}
                            isExpanded={isExpanded}
                            onToggle={() => setIsExpanded(!isExpanded)}
                        />
                        <div className="grid grid-cols-2 gap-3 relative w-full [&>*:nth-child(odd):last-child]:col-span-2">
                            {buttons.map((btn, i) => (
                                <CardButton key={i} btn={btn} isPopup={btn.type === 'popup'} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Modal - Portalled to body to escape parent transforms/z-index */}
            {isGalleryOpen && createPortal(
                <div className="fixed inset-0 z-[20000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setIsGalleryOpen(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition z-[20001]"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
                        <img
                            src={`/${section1Images[currentImageIndex]}`}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        {section1Images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-0 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition">
                                    <ChevronLeft size={40} />
                                </button>
                                <button onClick={nextImage} className="absolute right-0 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition">
                                    <ChevronRight size={40} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails in Modal */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4 py-2">
                        {section1Images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-12 h-12 rounded overflow-hidden border-2 transition ${currentImageIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                            >
                                <img src={`/${img}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default PublicCard;
