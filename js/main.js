/* -------------------------------- CONSTANTS -------------------------------- */

const API_KEY = "mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ";
let offset = 0;

const $dropdownButton = document.querySelector('#dropdown-button');
const $dropdownMenu = document.querySelector('#dropdown-menu');
const $suggestion = document.querySelector('.suggestion');
const $searchSuggestionsContainer = document.querySelector('.search-suggestions-container');
const $searchButton = document.querySelector('#search-btn');
const $searchInput = document.querySelector('#search-input');
const $searchTags = document.querySelector('.search-tags');
const $searchText = document.querySelector('.search-text');
const $suggestionsContainer = document.querySelector("#suggestions");
const $trendsContainer = document.querySelector("#trends");
const $searchResultsContainer = document.querySelector("#search-results");
const $suggestedGifsContainer = document.querySelector(".suggested-gifs-container");
const $trendingGifsContainer = document.querySelector(".trending-gifs-container");
const $searchGifsContainer = document.querySelector(".search-gifs-container");
const $searchForm = document.querySelector("#search-form");
const $searchSection = document.querySelector('#search');
const $cssTheme = document.querySelector('link#theme');
const $sailorDay = document.querySelector('.sailor-day');
const $sailorNight = document.querySelector('.sailor-night');
const $navRightContainer = document.querySelector('.nav-right-container');
const $buttonCrearGuifos = document.querySelector('.crear__guifos');
const $sectionGifsCreation = document.querySelector('#gifs__creation');
const $sectionMyGifs = document.querySelector('#my__gifs');
const $goBackArrowIcon = document.querySelector('.arrow');
const $myGifsContainer = document.querySelector('.mygifs-container');
const $myGuifos = document.querySelector('.mis__guifos');


/* -------------------------------- MAIN EVENT LISTENERS -------------------------------- */

// Starting function
window.onload = async () => {
    handleInitialTheme();
    await displayTrendingGifsHandler();
    await displaySuggestedGifsHandler();
};

window.onscroll = async () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (isHidden($searchResultsContainer)) {
            await displayTrendingGifsHandler();
        } else {
            await loadMoreSearchGifsHandler();
        }
    }
};

// Toggle del menu dropdown para cambiar de tema
$dropdownButton.onclick = () => {
    $dropdownMenu.classList.toggle('hidden');
};

// Oculta el dropdown de temas si el usuario clickea afuera
window.onclick = (e) => {
    hideElementsDOM($searchSuggestionsContainer);
    if (!e.target.closest('#dropdown-button')) {
        hideElementsDOM($dropdownMenu);
    }
};

// Al apretar escape culta las sugerencias de busqueda y/o el dropdown menu si están renderizados
document.onkeydown = (e) => {
    if (e.key === 'Escape') {
        hideElementsDOM($searchSuggestionsContainer, $dropdownMenu);
    }
};

// Change CSS themes listeners
$sailorDay.onclick = () => {
    $cssTheme.href = "./css/themes/sailor_day.css";
    sessionStorage.setItem("theme","./css/themes/sailor_day.css");
};
$sailorNight.onclick = () => {
    $cssTheme.href = "./css/themes/sailor_night.css";
    sessionStorage.setItem("theme","./css/themes/sailor_night.css");
};


$searchInput.oninput = async (e) => {
    const userInput = e.target.value;

    if (userInput === '') {
        $searchButton.disabled = true;
        hideElementsDOM($searchSuggestionsContainer);
    } else {
        $searchButton.disabled = false;
        showElementsDOM($searchSuggestionsContainer);
        await displaySuggestionsHandler(userInput);
    }
};

$searchForm.onsubmit = (e) => {
    e.preventDefault();
    handleSearchFunctionality($searchInput.value);
};

$myGuifos.onclick = () => {
    hideElementsDOM(
        $searchSection,
        $suggestionsContainer,
        $trendsContainer);

    showElementsDOM($sectionMyGifs);

    displayMyGifsHandler();
};



/* -------------------------------- HANDLERS FUNCTIONS -------------------------------- */


async function handleSearchFunctionality(searchInput) {
    offset = 0;
    const searchResultGifs = await fetchSearchResultGifs(searchInput);

    clearPreviousResults();
    clearInputValue();
    updateSearchText(searchInput);

    hideElementsDOM($searchSuggestionsContainer,
        $suggestionsContainer,
        $trendsContainer);

    showElementsDOM($searchTags,
        $searchResultsContainer,
        $searchTags);

    await displayTagsHandler(searchResultGifs);
    renderGridGifs(searchResultGifs, 'search');
}

async function loadMoreSearchGifsHandler() {
    const searchValue = getSearchValue();
    updateOffset();
    const searchResultGifs = await fetchSearchResultGifs(searchValue);
    renderGridGifs(searchResultGifs, 'search');
}

async function displayTagsHandler(searchGifs) {
    const searchGifsID = searchGifs.map(gif => gif.id);
    const relatedTags = await fetchRelatedTags(searchGifsID);
    renderRelatedTags(relatedTags);
    addTagsClickListeners();
}

async function displaySuggestedGifsHandler() {
    const trendingSearches = await fetchTrendingSearches();
    const suggestedGifs = await fetchSuggestedGifs(trendingSearches);
    renderSuggestedGifs(suggestedGifs);
}

async function displayTrendingGifsHandler() {
    const trendingGifs = await fetchTrendingGifs();
    renderGridGifs(trendingGifs, 'trending');
}

async function displaySuggestionsHandler(userInput) {
    const suggestions = await fetchSearchSuggestions(userInput);
    renderSearchSuggestions(suggestions);
    addSuggestionsClickListeners();
}

function displayMyGifsHandler() {
    const myGifs = getMyGifs();
    showElementsDOM($sectionMyGifs);
    renderMyGifs(myGifs);
}


/* -------------------------------- FETCH API CALLS -------------------------------- */


// General Fetch Utility Function
async function fetchURL(url, params) {
    try {
        const response = await fetch(url, params);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return;
    }
}

async function fetchRelatedTags(ids) {
    const queryIDS = ids.join(',');
    const url = `https://api.giphy.com/v1/gifs?ids=${queryIDS}&api_key=${API_KEY}`;
    const relatedGifsMetadata = await fetchURL(url);
    const relatedTags = relatedGifsMetadata.data.map(relatedGif => relatedGif.title);
    return relatedTags;
}

async function fetchSearchResultGifs(searchInput, limit = 20) {
    const url = `https://api.giphy.com/v1/gifs/search?q=${searchInput}&api_key=${API_KEY}&limit=${limit}&rating=pg-13&offset=${offset}`;
    let searchResultGifs = await fetchURL(url);
    searchResultGifs = searchResultGifs.data;
    return searchResultGifs;
}

async function fetchTrendingGifs(limit = 20) {
    const url = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13&offset=${Math.floor(Math.random()*300)}`;
    let trendingGifs = await fetchURL(url);
    trendingGifs = trendingGifs.data
    return trendingGifs;
}


// Esta función va a traer las búsquedas populares sugeridas (Strings) para luego traer gifs sugeridos
async function fetchTrendingSearches() {
    const url = `https://api.giphy.com/v1/trending/searches?api_key=${API_KEY}`;
    let trendingSearches = await fetchURL(url);
    trendingSearches = trendingSearches.data;
    return trendingSearches;
}

// Esta función va a traer los gifs sugeridos de nuestra página 
async function fetchSuggestedGifs(searches) {
    // Selecciona una búsqueda al azar de el array de búsquedas populares
    const searchTag = searches[Math.floor(Math.random() * searches.length)];
    // Hacemos una query a la API para que traiga los gifs con la busqueda popular seleccionada
    const url = `https://api.giphy.com/v1/gifs/search?q=${searchTag}&api_key=${API_KEY}&limit=${'4'}&rating=pg-13`;
    let suggestedGifs = await fetchURL(url);
    suggestedGifs = suggestedGifs.data;
    return suggestedGifs;
}

async function fetchSearchSuggestions(input) {
    const url = `https://api.giphy.com/v1/gifs/search/tags?q=${input}&api_key=${API_KEY}`;
    let searchSuggestions = await fetchURL(url);
    searchSuggestions = searchSuggestions.data;
    return searchSuggestions;
}

/* -------------------------------- DOM RENDERING FUNCTIONS -------------------------------- */


function renderSearchSuggestions(suggestions) {
    // Limpiamos las sugerencias anteriores
    $searchSuggestionsContainer.innerHTML = '';

    let newSuggestionHTML;
    // Renderizamos todas las nuevas sugerencias
    suggestions.forEach(suggestion => {
        newSuggestionHTML = `<button class="suggestion""><span>${suggestion.name}</span></button>`;
        $searchSuggestionsContainer.insertAdjacentHTML('beforeend', newSuggestionHTML);
    });
}

function renderGridGifs(gifs, type) {
    gifs.forEach(gif => {
        // Si la proporcion del gif es ancha entonces le asignamos la clase 'double' para que ocupe 2 casillas en el GRID
        const ratio = gif.images["480w_still"].width / gif.images["480w_still"].height;
        const gifClass = ratio >= 1.5 ? 'double' : '';
        insertGifToDOM(gif, type, gifClass);
    });
}

function renderRelatedTags(tags) {
    tags.forEach(tag => {
        // Si el título del tag esta vacío o contiene solo espacios, no se renderiza.
        if (tag.replace(" ", "") !== '') {
            $searchTags.insertAdjacentHTML('beforeend', `<button class="tag">${tag}</button>`);
        }
    });
}

function renderSuggestedGifs(suggestedGifs) {
    suggestedGifs.forEach(gif => insertGifToDOM(gif, 'suggested'));
}

function renderMyGifs(gifs) {
    $myGifsContainer.innerHTML = '';
    gifs.forEach(gif => insertGifToDOM(gif, 'myGif'));
}


function getWindowGifHTML(gif, gifType, gifClass = '') {
    // Si el titulo del gif es muy largo evita el salto de linea agregando ... al final de la primera linea
    const gifTitle = gif.title.length > 34 ? gif.title.slice(0, 34) + '...' : gif.title;

    const gifHeaderHTML = `<div class="window__header__gradient">
                                <span>${gifTitle}</span>
                                <img class="button-close" src="./assets/icons/button_close.svg" alt="">
                           </div>`;

    const windowGifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                                ${gifHeaderHTML}
                                <div class="gif-bottom-container">
                                    <img class="gif-image" src="${gif.images.original.url}"/>
                                    <a class="tag" href="${gif.bitly_url}">Ver más...</a>
                                </div>
                           </div>`;

    return windowGifHTML;
}

function getGifHTML(gif, gifType, gifClass = '') {
    // Agrega un hash # al comienzo de cada palabra del titulo
    const hashedTitle = gif.title.split(" ").map(el => el = "#" + el).join(" ");

    const gifFooter = `<div class="gif-footer-container">
                            <span>${hashedTitle}</span>
                       </div>`;

    const gifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                            <div class="gif-bottom-container">
                                <a href="${gif.bitly_url}"><img class="gif-image" src="${gif.images.original.url}"/></a>
                                ${gifFooter}
                            </div>
                     </div>`;

    return gifHTML;
}

function insertGifToDOM(gif, gifType, gifClass = '') {
    switch (gifType) {
        case 'suggested':
            const suggestedGifHTML = getWindowGifHTML(gif, gifType, gifClass);
            $suggestedGifsContainer.insertAdjacentHTML('beforeend', suggestedGifHTML);
            break;
        case 'trending':
            const trendingGifHTML = getGifHTML(gif, gifType, gifClass);
            $trendingGifsContainer.insertAdjacentHTML('beforeend', trendingGifHTML);
            break;
        case 'search':
            const searchGifHTML = getGifHTML(gif, gifType, gifClass);
            $searchGifsContainer.insertAdjacentHTML('beforeend', searchGifHTML);
            break;
        case 'myGif':
            const myGifHTML = getGifHTML(gif, gifType, gifClass);
            $myGifsContainer.insertAdjacentHTML('beforeend', myGifHTML);
            break;
        default:
            console.log(`The gif type ${gifType} is not supported`);
            break;
    }
}


/* -------------------------------- UTILITIES FUNCTIONS -------------------------------- */


function showElementsDOM(...elements) {
    elements.forEach(element => element.classList.remove('hidden'));
}

function hideElementsDOM(...elements) {
    elements.forEach(element => element.classList.add('hidden'));
}

function getMyGifs() {
    let myGifs = [];
    let item;
    Object.keys(localStorage).forEach(function (key) {
        item = localStorage.getItem(key);
        if (item.includes('gif')) {
            const gifObject = JSON.parse(item);
            myGifs.push(gifObject);
        }
    });

    return myGifs;
}

function addSuggestionsClickListeners() {
    document.querySelectorAll('.suggestion').forEach(sugg => {
        // Listeners (Al clickear una sugerencia, activamos una búsqueda en base al título de la misma)
        sugg.onclick = () => handleSearchFunctionality(sugg.innerText);
    });
}

function addTagsClickListeners() {
    const tags = document.querySelectorAll('.search-tags .tag');
    tags.forEach(tag => tag.onclick = () => {
        processedTag = processTagTitleForQuery(tag.innerText);
        handleSearchFunctionality(processedTag);
    });
}

function processTagTitleForQuery(tagTitle) {
    return tagTitle.split(" ").join("+");
}

function clearPreviousResults() {
    $searchTags.innerHTML = '';
    $searchGifsContainer.innerHTML = '';
}

function clearInputValue() {
    $searchInput.value = '';
}

function updateSearchText(input) {
    $searchText.innerHTML = `Resultados de búsqueda: <span class="search-value">${input}<span>`;
}

function getSearchValue() {
    return document.querySelector('.search-value').innerText;
}
function isHidden(element) {
    return element.classList.contains('hidden');
}

function updateOffset() {
    offset = offset + 20;
}

function handleInitialTheme() {
    if (sessionStorage.getItem("theme")) {
        $cssTheme.href = sessionStorage.getItem("theme");
    }
}


/* -------------------------------- GIFS CREATION SECTION -------------------------------- */


$buttonCrearGuifos.onclick = () => {
    createGifsSection();
};

function createGifsSection() {

    // Initial variables

    let recorder;
    let gifSrc;
    let newGifID;

    const timer = {
        duration: 0,
        reset() {
            this.duration = 0;
            $recordingTime.innerHTML = 'Empezando grabación...';
        },
        start() {
            this.interval = setInterval(() => {
                let hours, minutes, seconds, formattedDuration;
                duration = this.duration++;

                seconds = duration % 60;
                minutes = Math.floor(duration / 60);
                hours = Math.floor(duration / 3600);

                seconds = seconds < 10 ? '0' + seconds : seconds;
                minutes = minutes < 10 ? '0' + minutes : minutes;
                hours = hours < 10 ? '0' + hours : hours;

                formattedDuration = `${hours}:${minutes}:${seconds}`;
                $recordingTime.innerHTML = formattedDuration;
            }, 1000);
        },
        stop() {
            clearInterval(this.interval);
        }
    }; //timer

    // Elements

    const $phase1 = document.querySelector('#phase__1');
    const $phase2 = document.querySelector('#phase__2');
    const $phase3 = document.querySelector('#phase__3');
    const $phase4 = document.querySelector('#phase__4');
    const $preRecording = document.querySelector('#pre-recording');
    const $recording = document.querySelector('#recording');
    const $postRecording = document.querySelector('#post-recording');
    const $startGifsCreation = document.querySelector('.start__button');
    const $cancelGifCreation = document.querySelector('.cancel-gif-creation');
    const $videoContainer = document.querySelector('.video-container');
    const $gifPreview = document.querySelector('.gif-preview');
    const $gifDetailsPreview = document.querySelector('.gif-details-preview');
    const $startRecording = document.querySelector('.start-recording');
    const $stopRecording = document.querySelector('.stop-recording');
    const $recordingTime = document.querySelector('.recording__time');
    const $windowHeaderText = document.querySelector('.window__header__text');
    const $repeatRecording = document.querySelector('#repeat-recording');
    const $uploadGuifo = document.querySelector('#upload-guifo');
    const $loadingItems = document.querySelectorAll('.loading-bar__item');
    const $copyGifLink = document.querySelector('#copy-gif-link');
    const $downloadGif = document.querySelector('#download-gif');
    const $finishGifCreation = document.querySelector('.finish-gif-creation');
    const $closeButtons = document.querySelectorAll('#gifs__creation .button-close');


    $closeButtons.forEach(button => {
        button.onclick = () => {
            hideElementsDOM($phase1, $phase2, $phase3, $phase4);
            displayMyGifsHandler();
        };
    });

    // Starting function

    function displayCreateGifsSection() {
        hideElementsDOM($navRightContainer,
            $searchSection,
            $suggestionsContainer,
            $trendsContainer);

        showElementsDOM($sectionGifsCreation, $goBackArrowIcon);
    }

    displayCreateGifsSection();

    $startGifsCreation.onclick = () => initializePhaseTwo();

    $cancelGifCreation.onclick = () => $goBackArrowIcon.click();

    function initializePhaseTwo() {
        displayPhaseTwoElements();
        getWebcamStreamVideo();
    }

    function displayPhaseTwoElements() {
        hideElementsDOM($phase1);
        showElementsDOM($phase2);
    }

    $startRecording.onclick = () => {
        startRecording();
        hideElementsDOM($preRecording);
        showElementsDOM($recording);
        $windowHeaderText.innerHTML = 'Capturando tu Guifo';
    };

    $stopRecording.onclick = () => {
        stopRecording();
        hideElementsDOM($recording, $videoContainer);
        showElementsDOM($gifPreview, $postRecording);
        $windowHeaderText.innerHTML = 'Vista Previa';
        setGifSrc();
        cleanRecorder();
    };

    $repeatRecording.onclick = async () => {
        hideElementsDOM($postRecording, $gifPreview);
        showElementsDOM($recording, $videoContainer);
        await getWebcamStreamVideo();
        startRecording();
    };

    $uploadGuifo.onclick = async () => {
        showUploadingWindow();
        const interval = animateLoadingBar();
        const newGif = await uploadGif();
        newGifID = newGif.data.id;
        clearInterval(interval);
        showGifDetails();
        if (newGif.meta.status === 200) {
            saveGifToLocalStorage(newGifID);
        }
        setTimeout(() => displayMyGifsHandler(), 1000);
    };

    $copyGifLink.onclick = async () => {
        await copyGifLink();
    };
    $downloadGif.onclick = async () => {
        await downloadGif();
    };

    $finishGifCreation.onclick = () => $goBackArrowIcon.click();

    function showUploadingWindow() {
        hideElementsDOM($phase2);
        showElementsDOM($phase3);
    }

    function showGifDetails() {
        hideElementsDOM($phase3);
        showElementsDOM($phase4);
        $gifDetailsPreview.src = URL.createObjectURL(gifSrc);
    }

    async function getWebcamStreamVideo() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    height: {
                        max: 450
                    }
                },
                audio: false
            });
            $videoContainer.srcObject = stream;
            $videoContainer.play();
        } catch (error) {
            alert(error.name + "\nAl parecer no hay disponible una cámara en este dispositivo");
        }
    }

    function startRecording() {
        try {
            const stream = $videoContainer.srcObject;
            recorder = new RecordRTC(stream, {
                type: "gif",
                frameRate: 1,
                quality: 10,
                width: 360,
                hidden: 240
            });
            recorder.startRecording();
            timer.reset();
            timer.start();
            recorder.camera = stream;
        } catch (error) {
            alert(error.name);
        }
    }

    function stopRecording() {
        recorder.stopRecording();
        recorder.camera.stop();
        timer.stop();
    }

    async function setGifSrc() {
        let blob = await recorder.getBlob();
        gifSrc = blob;
        $gifPreview.src = URL.createObjectURL(gifSrc);
    }

    function cleanRecorder() {
        recorder.reset();
        recorder.destroy();
        recorder = null;
    }

    function animateLoadingBar() {
        let counter = 0;
        return setInterval(() => {
            if (counter < $loadingItems.length) {
                $loadingItems[counter].classList.toggle('loading-bar__item__active');
                counter++;
            } else {
                $loadingItems.forEach(loadingItem => {
                    loadingItem.classList.toggle('loading-bar__item__active');
                });
                counter = 0;
            }
        }, 100);
    }

    async function uploadGif() {
        const formData = new FormData();
        formData.append('file', gifSrc, 'myGif.gif');
        const params = {
            method: 'POST',
            body: formData,
            json: true
        };
        const data = await fetchURL(`https://upload.giphy.com/v1/gifs?api_key=${API_KEY}`, params);
        return await data;
    }

    async function saveGifToLocalStorage(gifID) {
        const response = await fetchURL(`https://api.giphy.com/v1/gifs/${gifID}?api_key=${API_KEY}`);
        const stringifiedData = JSON.stringify(response.data);
        localStorage.setItem(`Gif: ${gifID}`, stringifiedData);
    }

    async function copyGifLink() {
        const gifURL = `https://giphy.com/gifs/${newGifID}`;
        await navigator.clipboard.writeText(gifURL);
        console.log('Link copiado con exito');
    }

    async function downloadGif() {
        const downloadUrl = `https://media.giphy.com/media/${newGifID}/giphy.gif`;
        const fetchedGif = fetch(downloadUrl);
        const blobGif = (await fetchedGif).blob();
        const urlGif = URL.createObjectURL(await blobGif);
        const saveImg = document.createElement("a");
        saveImg.href = urlGif;
        saveImg.download = "downloaded-guifo.gif";
        saveImg.style = 'display: "none"';
        document.body.appendChild(saveImg);
        saveImg.click();
        document.body.removeChild(saveImg);
    }
} // create gifs section
