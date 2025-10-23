
function main() {
    const head = document.querySelector('head');
    const body = document.querySelector('body');

    const domParser = new DOMParser();
    fetch('./pages/music-list/music-list.html')
        .then(response => response.text())
        .then(rawHtml => domParser.parseFromString(rawHtml, 'text/html'))
        .then(element => {
            const linkElements = element.querySelectorAll('link');
            const scriptElements = element.querySelectorAll('script');

            for (let element of linkElements){
                head.appendChild(element)
            }

            body.appendChild(element.body.firstChild)

            for (let element of scriptElements){
                const script = document.createElement('script');

                script.src = element.src;

                body.appendChild(script);
            }
        });
}

document.addEventListener('DOMContentLoaded', main)
