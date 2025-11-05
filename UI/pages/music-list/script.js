
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

    const cancelButton = dialogElement.querySelector('#cancel-button');

    const formElement = dialogElement.querySelector('form')

    formElement.addEventListener('submit', onFormSubmitPost)
    cancelButton.addEventListener('click', onCancelButtonClick);

    dialogElement.showModal();
}

async function onEditButtonClick(id) {
    const song = (await getData())
        .find(x => x.id === id);

    if (song === null){
        alert('Música não encontrada!');
        await refreshListComponent();
    }

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

    const cancelButton = dialogElement.querySelector('#cancel-button');
    const formElement = dialogElement.querySelector('dialog form');

    formElement.addEventListener('submit', e => onFormSubmitPut(e, id))
    cancelButton.addEventListener('click', onCancelButtonClick);

    const imageElement = formElement.querySelector('#cover');
    const titleSpan = formElement.querySelector('#title');
    const authorSpan = formElement.querySelector('#artist');
    const albumSpan = formElement.querySelector('#album');
    const categorySpan = formElement.querySelector('#category');
    const durationSpan = formElement.querySelector('#duration');

    imageElement.value = song.capa;
    titleSpan.value = song.nome;
    authorSpan.value = song.autor;
    albumSpan.value = song.album;
    categorySpan.value = song.genero;
    durationSpan.value = `${song.duracao}`;

    dialogElement.showModal();

    await refreshListComponent();
}

async function onDeleteButtonClick(id) {

    await fetch(
        `http://localhost:5195/songs/${id}`,
        {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                alert('Falha ao deletar a música!')
            }
        });

    await refreshListComponent();
}

function onCancelButtonClick() {
    dialogElement.close();
}

async function onFormSubmitPost(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = Object.fromEntries(formData.entries());

    await fetch(
        'http://localhost:5195/songs',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Or other appropriate type
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                alert('Falha ao criar a música!')
            }
        });

    dialogElement.close();
}

async function onFormSubmitPut(event, id) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = Object.fromEntries(formData.entries());

    await fetch(
        `http://localhost:5195/songs/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json' // Or other appropriate type
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                alert('Falha ao criar a música!')
            }
        });

    dialogElement.close();
}

async function refreshListComponent() {

    const songs = await getData(inputElement.value);

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

async function getData(text) {
    const songs = await fetch(`http://localhost:5195/songs?text=${text}`)
        .then(async x => await x.json());

    return songs;
}

function secondsToDuration(totalSeconds) {
    const minutes = Math.trunc(totalSeconds / 60)
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
