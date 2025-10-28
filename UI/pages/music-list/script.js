
const domParser = new DOMParser();

const inputElement = document.querySelector('#component input');
const listElement = document.querySelector('#list');
const addSongButton = document.querySelector('#page .add-button');
const dialogElement = document.querySelector('#page dialog');

async function onInputChange(event) {
    await refreshListComponent(event.target.value);
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

    await refreshListComponent(inputElement.value);
}

async function onDeleteButtonClick(id) {
    alert(`DELETE ${id}`);

    await refreshListComponent(inputElement.value);
}

async function refreshListComponent(input) {

    const songs = (await getData(input))
        .filter(x => x.title.toLowerCase().includes(input.toLowerCase()));

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

        imageElement.src = song.cover;
        titleSpan.innerText = song.title;
        authorSpan.innerText = song.author;
        albumSpan.innerText = song.album;
        categorySpan.innerText = song.category;
        durationSpan.innerText = secondsToDuration(song.duration);

        editButtonElement.addEventListener('click', () => onEditButtonClick(song.id));
        deleteButtonElement.addEventListener('click', () => onDeleteButtonClick(song.id));

        listElement.appendChild(clone);
    }
}

async function getData(input) {
    return [
        {
            id: 1,
            title: "Stereo Love",
            author: "N/A",
            album: "Album 1",
            cover: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.iomoio.com%2Fcovers%2F150%2F22%2F265322.jpg&f=1&nofb=1&ipt=f4ae276943de89b8064f93c2e02d357d4f034cb8dc56c37f678fec7780186385",
            category: 'Rock',
            duration: 265
        },
        {
            id: 2,
            title: "Bad Romance",
            author: "Lady Gaga",
            album: "Album 2",
            cover: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ff4.bcbits.com%2Fimg%2Fa0273398113_10.jpg&f=1&nofb=1&ipt=be1922e642c92b88e7e27aeea8b7d30683799d9cb722701c70cf57c736685194",
            category: 'Pop',
            duration: 207
        },
        {
            id: 3,
            title: "Musica",
            author: "Lady Gaga",
            album: "Album 2",
            cover: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fstatic1.squarespace.com%2Fstatic%2F56454c01e4b0177ad4141742%2F56f3eeaa6e06f2df013dd6cd%2F56f3ef166e06f2df013de90c%2F1458827030375%2FCovers-Vol.-1-Cover.jpg%3Fformat%3Doriginal&f=1&nofb=1&ipt=5689428726ee7f772f3153d6297f8bb1aa034d7a394a36076941bb5b23ea799b",
            category: 'Pop',
            duration: 207
        }
    ]
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

    await refreshListComponent('');
}

main();
