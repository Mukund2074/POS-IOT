(function() {
    const containerId = 'fiind-embed-' + Math.random().toString(36).substr(2, 9);
    
    // container
    const container = document.createElement('div');
    container.id = containerId;
    container.style.width = '100%';
    container.style.height = '100vh';
    container.style.border = 'none';
    container.style.overflow = 'hidden';
    
    // iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    const script = document.currentScript;
    const bookingUrl = script.getAttribute('data-booking-url');
    if (!bookingUrl) {
        console.error('Missing data-booking-url attribute');
        return;
    }
    
    iframe.src = bookingUrl;
    
    container.appendChild(iframe);
    
    script.parentNode.insertBefore(container, script.nextSibling);
})();
