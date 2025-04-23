import { useEffect, useCallback, useRef } from 'react';

export const UseScrollToBottom = (options = {}) => {
    const {
      callback,
      offset = 100,
      debounce = 200,
      useWindow = false
    } = options;
  
    const containerRef = useRef(null);
    const timeoutRef = useRef(null);
    const targetRef = useRef(null);
  
    const checkBottom = useCallback(() => {
      let element, scrollTop, clientHeight, scrollHeight;
  
      if (useWindow) {
        element = document.documentElement;
        scrollTop = window.scrollY || element.scrollTop;
        clientHeight = window.innerHeight;
        scrollHeight = element.scrollHeight;
      } else {
        element = containerRef.current;
        if (!element) return;
        scrollTop = element.scrollTop;
        clientHeight = element.clientHeight;
        scrollHeight = element.scrollHeight;
      }
  
      const isBottom = scrollTop + clientHeight >= scrollHeight - offset;
      if (isBottom) callback();
    }, [callback, offset, useWindow]);
  
    const handleScroll = useCallback(() => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(checkBottom, debounce);
    }, [checkBottom, debounce]);
  
    useEffect(() => {
      const setupScrollListener = () => {
        targetRef.current = useWindow ? window : containerRef.current;
        if (!targetRef.current) return;
        
        targetRef.current.addEventListener('scroll', handleScroll);
      };
      
      const timer = setTimeout(setupScrollListener, 100);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timeoutRef.current);
        
        if (targetRef.current) {
          targetRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }, [handleScroll, useWindow]);
  
    return containerRef;
  }

export default UseScrollToBottom;