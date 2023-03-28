const getJSON = (props) => {
    
    let url = props.url;
    
    if(props.params) {
        url += '?'+new URLSearchParams(props.params).toString();
    }
    
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open("GET", url);
    xhr.onreadystatechange = (evt) => {
        
        
        if(xhr.readyState == 4 && xhr.status == 200) {
            
            if(props.onSuccess)
                props.onSuccess(xhr.response);
            
        }
        else if (xhr.status !== 200) {
            if(props.onError)
                props.onError(xhr);
        }
        
    }
    
    xhr.send();
    return xhr;
    
}

export { getJSON };

const postJSON = (props) => {
    
    let url = props.url;
        
    return fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(props.body)
    })
    .then((response) => response.json())
    .then((data) => {
        
        if(props.onSuccess)
            props.onSuccess(data);    
        
    })
    .catch(error => {
        
        if(props.onError)
            props.onError(error);
        
    })
    
}

export { postJSON };