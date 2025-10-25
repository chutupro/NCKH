import { useRef, useState } from 'react';

// Generic drag-to-scroll hook for horizontal carousels/lists
// Returns: { scrollRef, isDragging, hasMoved, handlers, scrollBy }
export default function useDragScroll() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const onMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // sensitivity
    if (Math.abs(walk) > 5) setHasMoved(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollBy = (direction, amount = 320) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return {
    scrollRef,
    isDragging,
    hasMoved,
    handlers: { onMouseDown, onMouseLeave, onMouseUp, onMouseMove },
    scrollBy,
  };
}
