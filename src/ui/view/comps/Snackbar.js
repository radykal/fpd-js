const Snackbar = (text='', autoRemove=true) => {
    
    let snackbarWrapper = document.body.querySelector('.fpd-snackbar-wrapper');
    
    if(!snackbarWrapper) {
        
        snackbarWrapper = document.createElement('div');
        snackbarWrapper.className = 'fpd-snackbar-wrapper';
        
        document.body.append(snackbarWrapper)
        
    }
    
    const content = document.createElement('div');
    content.className = 'fpd-snackbar fpd-shadow-1';
    content.innerHTML = '<p>'+text+'</p>';
    content.addEventListener('click', (evt) => {
        content.remove();
    })
    
    snackbarWrapper.append(content);
    
    if(autoRemove) {
        setTimeout(function() {
            content.remove();
        }, 5000);
    }
    
    return content;  
}

export default Snackbar;

window.FPDSnackbar = Snackbar;
