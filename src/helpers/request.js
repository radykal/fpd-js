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

    let headers = {
        'Accept': 'application/json'
    };
    
    if(!(props.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
        
    return fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: headers,
        body: props.body instanceof FormData ? props.body : JSON.stringify(props.body)
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

const fetchText = (props) => {
    
    let url = props.url;
    
    return fetch(url)
    .then(res => {
        
        if(res.ok) {
            
            res.text().then(text => {
                if(props.onSuccess)
                    props.onSuccess(text);
            });
            
        }
        else {
            
            res.text().then(error => {
                if(props.onError)
                    props.onError(error);
            });
            
        }
        
    })
    
}

export { fetchText };