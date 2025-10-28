
const domParser = new DOMParser();

const inputElement = document.querySelector('#component input');
const listElement = document.querySelector('#list');
const addSongButton = document.querySelector('#page .add-button');
const dialogElement = document.querySelector('#page dialog');

async function onInputChange() {
    await refreshListComponent();
}

async function onAddSongButtonClick() {

    while (dialogElement.firstChild) {
        dialogElement.firstChild.remove();
    }

    const component = await fetch('pages/music-list/components/music-modal.html')
        .then(response => response.text())
        .then(rawHtml => domParser.parseFromString(rawHtml, 'text/html'))
        .then(html => html.body);

    for (let e of component.childNodes){
        dialogElement.appendChild(e);
    }

    dialogElement.showModal();
}

async function onEditButtonClick(id) {
    alert(`UPDATE ${id}`);

    await refreshListComponent();
}

async function onDeleteButtonClick(id) {
    alert(`DELETE ${id}`);

    await refreshListComponent();
}

async function refreshListComponent() {

    const songs = (await getData())
        .filter(x => x.nome.toLowerCase().includes(inputElement.value.toLowerCase()));

    const component = await fetch('pages/music-list/components/music-item.html')
        .then(response => response.text())
        .then(rawHtml => domParser.parseFromString(rawHtml, 'text/html'))
        .then(html => html.body.firstChild);

    while (listElement.firstChild) {
        listElement.firstChild.remove();
    }

    for (let song of songs) {
        const clone = component.cloneNode(true);

        const imageElement = clone.querySelector('img');
        const titleSpan = clone.querySelector('.title');
        const authorSpan = clone.querySelector('.author');
        const albumSpan = clone.querySelector('.album');
        const categorySpan = clone.querySelector('.category');
        const durationSpan = clone.querySelector('.duration');

        const editButtonElement = clone.querySelector('.edit-icon');
        const deleteButtonElement = clone.querySelector('.delete-icon');

        imageElement.src = song.capa;
        titleSpan.innerText = song.nome;
        authorSpan.innerText = song.autor;
        albumSpan.innerText = song.album;
        categorySpan.innerText = song.genero;
        durationSpan.innerText = secondsToDuration(song.duracao);

        editButtonElement.addEventListener('click', () => onEditButtonClick(song.id));
        deleteButtonElement.addEventListener('click', () => onDeleteButtonClick(song.id));

        listElement.appendChild(clone);
    }
}

async function getData() {
    const songs = await fetch('http://localhost:5195/songs')
        .then(async x => await x.json());

    return songs;
}

function secondsToDuration(totalSeconds) {
    const minutes = (totalSeconds / 60)
        .toFixed(0)
        .toString()
        .padStart(2, '0');

    const seconds = (totalSeconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}`;
}

async function main() {
    inputElement.addEventListener('input', onInputChange);

    addSongButton.addEventListener('click', onAddSongButtonClick);

    await refreshListComponent();
}

main();
