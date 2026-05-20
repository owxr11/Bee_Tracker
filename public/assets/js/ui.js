export const showLoader = (elementId, loadingText = "Procesando...") => {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.disabled = true;
    el.innerHTML= `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${loadingText}`;
};

export const hideLoader= (elementId, originalHTML) => {
    const el=document.getElementById(elementId);
    if (!el) return;
    
    el.disabled= false;
    el.innerHTML= originalHTML;
};