/* -------------------------------- CONSTANTS -------------------------------- */

const API_KEY = "mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ";

const elementsDOM = {
    dropdownButton: document.querySelector('#dropdown-button'),
    dropdownMenu: document.querySelector('#dropdown-menu'),
    suggestion: document.querySelector('.suggestion'),
    searchSuggestionsContainer: document.querySelector('.search-suggestions-container'),
    searchButton: document.querySelector('#search-btn'),
    searchInput: document.querySelector('#search-input'),
    searchTags: document.querySelector('.search-tags'),
    searchText: document.querySelector('.search-text'),
    suggestionsContainer: document.querySelector("#suggestions"),
    trendsContainer: document.querySelector("#trends"),
    searchResultsContainer: document.querySelector("#search-results"),
    suggestedGifsContainer: document.querySelector(".suggested-gifs-container"),
    trendingGifsContainer: document.querySelector(".trending-gifs-container"),
    searchGifsContainer: document.querySelector(".search-gifs-container"),
    searchForm: document.querySelector("#search-form"),
    searchSection: document.querySelector('#search'),
    cssTheme: document.querySelector('link#theme'),
    navRightContainer: document.querySelector('.nav-right-container'),
    buttonCrearGuifos: document.querySelector('.crear__guifos'),
    sectionGifsCreation: document.querySelector('#gifs__creation'),
    sectionMyGifs: document.querySelector('#my__gifs'),
    arrowIcon: document.querySelector('.arrow')
};


/* -------------------------------- MAIN EVENT LISTENERS -------------------------------- */

// Starting function
window.onload = async function () {
    const trendingGifs = await fetchTrendingGifs();
    renderGridGifs(trendingGifs, 'trending');
    const trendingSearches = await fetchTrendingSearches();
    const suggestedGifs = await fetchSuggestedGifs(trendingSearches);
    renderSuggestedGifs(suggestedGifs);
};

// Toggle del menu dropdown para cambiar de tema
elementsDOM.dropdownButton.onclick = function (e) {
    e.preventDefault();
    elementsDOM.dropdownMenu.classList.toggle('hidden');
};

// Oculta el dropdown de temas si el usuario clickea afuera
window.onclick = function (e) {
    hideElementsDOM(elementsDOM.searchSuggestionsContainer);
    if (!e.target.closest('#dropdown-button')) hideElementsDOM(elementsDOM.dropdownMenu);
};

document.onkeydown = (e) => {
    if (e.key === 'Escape') {
        hideElementsDOM(elementsDOM.searchSuggestionsContainer, elementsDOM.dropdownMenu);
    }
};

// Change CSS themes listeners
document.querySelector('.dropdown-menu-item.sd').onclick = () => {
    elementsDOM.cssTheme.setAttribute("href", "./css/themes/sailor_day.css");
};
document.querySelector('.dropdown-menu-item.sn').onclick = () => {
    elementsDOM.cssTheme.setAttribute("href", "./css/themes/sailor_night.css");
};

elementsDOM.searchInput.oninput = async (e) => {
    const userInput = e.target.value;

    if (userInput === '') {
        elementsDOM.searchButton.disabled = true;
        hideElementsDOM(elementsDOM.searchSuggestionsContainer);
    } else {
        elementsDOM.searchButton.disabled = false;
        showElementsDOM(elementsDOM.searchSuggestionsContainer);
        const suggestions = await fetchSearchSuggestions(userInput);
        renderSearchSuggestions(suggestions);
        addSuggestionsClickListeners();
    }
};

elementsDOM.searchForm.onsubmit = (e) => {
    e.preventDefault();
    handleSearchFunctionality(elementsDOM.searchInput.value);
};



/* -------------------------------- HANDLERS FUNCTIONS -------------------------------- */


async function handleSearchFunctionality(searchInput) {
    const searchResultGifs = await fetchSearchResultGifs(searchInput);

    clearPreviousResults();
    elementsDOM.searchInput.value = '';

    hideElementsDOM(elementsDOM.searchSuggestionsContainer,
        elementsDOM.suggestionsContainer,
        elementsDOM.trendsContainer);

    showElementsDOM(elementsDOM.searchTags,
        elementsDOM.searchResultsContainer,
        elementsDOM.searchTags);

    const searchGifsID = searchResultGifs.map(gif => gif.id);
    const relatedTags = await fetchRelatedTags(searchGifsID);
    renderRelatedTags(relatedTags);
    addTagsClickListeners();

    updateSearchText(searchInput);
    renderGridGifs(searchResultGifs, 'search');
}


/* -------------------------------- FETCH API CALLS -------------------------------- */



// General Fetch Utility Function
async function fetchURL(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error(error);
        return;
    }
}

async function fetchRelatedTags(ids) {
    const queryIDS = ids.join(',');
    const url = `http://api.giphy.com/v1/gifs?ids=${queryIDS}&api_key=${API_KEY}`;
    const relatedGifsMetadata = await fetchURL(url);
    const relatedTags = relatedGifsMetadata.map(relatedGif => relatedGif.title);
    return relatedTags;
}

async function fetchSearchResultGifs(searchInput, limit = 20) {
    const url = `http://api.giphy.com/v1/gifs/search?q=${searchInput}&api_key=${API_KEY}&limit=${limit}&rating=pg-13`;
    const searchResultGifs = await fetchURL(url);
    return searchResultGifs;
}

async function fetchTrendingGifs(limit = 20) {
    const url = `http://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13&offset=${Math.floor(Math.random()*300)}`;
    const trendingGifs = await fetchURL(url);
    return trendingGifs;
}


// Esta función va a traer las búsquedas populares sugeridas (Strings) para luego traer gifs sugeridos
async function fetchTrendingSearches() {
    const url = `http://api.giphy.com/v1/trending/searches?api_key=${API_KEY}`;
    const trendingSearches = await fetchURL(url);
    return trendingSearches;
}

// Esta función va a traer los gifs sugeridos de nuestra página 
async function fetchSuggestedGifs(searches) {
    // De el array de búsquedas populares, selecciona uno al azar
    const searchTag = searches[Math.floor(Math.random() * searches.length)];
    // Hacemos una query a la API para que traiga los gifs con la busqueda popular seleccionada
    const url = `http://api.giphy.com/v1/gifs/search?q=${searchTag}&api_key=${API_KEY}&limit=${'4'}&rating=pg-13`;
    const suggestedGifs = await fetchURL(url);
    return suggestedGifs;
}

async function fetchSearchSuggestions(input) {
    const url = `http://api.giphy.com/v1/gifs/search/tags?q=${input}&api_key=${API_KEY}`;
    const searchSuggestions = await fetchURL(url);
    return searchSuggestions;
}



/* -------------------------------- DOM RENDERING FUNCTIONS -------------------------------- */



function renderSearchSuggestions(suggestions) {
    // Limpiamos las sugerencias anteriores
    elementsDOM.searchSuggestionsContainer.innerHTML = '';

    let newSuggestionHTML;
    // Renderizamos todas las nuevas sugerencias
    suggestions.forEach(suggestion => {
        newSuggestionHTML = `<button class="suggestion""><span>${suggestion.name}</span></button>`;
        elementsDOM.searchSuggestionsContainer.insertAdjacentHTML('beforeend', newSuggestionHTML);
    });
}

function renderGridGifs(gifs, type) {
    gifs.forEach(gif => {
        // Si la proporcion del gif es ancha entonces le asignamos la clase 'double' para que ocupe 2 casillas en el GRID
        let gifClass = gif.images["480w_still"].width / gif.images["480w_still"].height >= 1.5 ? 'double' : '';
        insertGifToDOM(gif, type, gifClass);
    });
}

function renderRelatedTags(tags) {
    tags.forEach(tag => {
        // Si el título del tag esta vacío o contiene solo espacios, no se renderiza.
        if (tag.replace(" ", "") !== '') {
            elementsDOM.searchTags.insertAdjacentHTML('beforeend', `<button class="tag">${tag}</button>`);
        }
    });
}

async function renderSuggestedGifs(suggestedGifs) {
    suggestedGifs.forEach(gif => insertGifToDOM(gif, 'suggested'));
}

function clearPreviousResults() {
    elementsDOM.searchTags.innerHTML = '';
    elementsDOM.searchGifsContainer.innerHTML = '';
}

function updateSearchText(input) {
    elementsDOM.searchText.innerHTML = `Resultados de búsqueda: ${input}`;
}

function insertGifToDOM(gif, gifType, gifClass = '') {

    if (gifType === 'suggested') {
        // Si el titulo del gif es muy largo evita el salto de linea agregando ... al final de la primera linea
        const gifTitle = gif.title.length > 34 ? gif.title.slice(0, 34) + '...' : gif.title;

        const verMasButton = `<a class="tag" href="${gif.bitly_url}">Ver más...</a>`;
        const closeButton = `<img class="button-close" src="./assets/icons/button close.svg" alt="">`;

        const gifHeaderHTML = `<div class="gif-header-container">
                                    <span>${gifTitle}</span>
                                    ${closeButton}
                               </div>`;

        const suggestedGifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                                        ${gifHeaderHTML}
                                        <div class="gif-bottom-container">
                                             <img class="gif-image" src="${gif.images.original.url}"/>
                                            ${verMasButton}
                                        </div>
                                     </div>`;

        elementsDOM.suggestedGifsContainer.insertAdjacentHTML('beforeend', suggestedGifHTML);

    } else if (gifType === 'trending' || gifType === 'search') {

        // Agrega un hash # al comienzo de cada palabra del titulo
        const hashedTitle = gif.title.split(" ").map(el => el = "#" + el).join(" ");

        const gifFooter = `<div class="gif-footer-container">
                                <span>${hashedTitle}</span>
                            </div>`;

        const trendingGifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                                    <div class="gif-bottom-container">
                                        <a href="${gif.bitly_url}"><img class="gif-image" src="${gif.images.original.url}"/></a>
                                        ${gifFooter}
                                    </div>
                                </div>`;

        // Seleccionamos el contenedor en el que se debe renderizar el nuevo gif (Trending o Search)
        const domElement = gifType === 'trending' ? elementsDOM.trendingGifsContainer : elementsDOM.searchGifsContainer;
        domElement.insertAdjacentHTML('beforeend', trendingGifHTML);
    }
}


/* -------------------------------- UTILITIES FUNCTIONS -------------------------------- */


function showElementsDOM(...elements) {
    elements.forEach(element => element.classList.remove('hidden'));
}

function hideElementsDOM(...elements) {
    elements.forEach(element => element.classList.add('hidden'));
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


/* -------------------------------- GIFS CREATION SECTION -------------------------------- */


elementsDOM.buttonCrearGuifos.onclick = () => {
    createGifsSection();
};

function createGifsSection() {

    const _webcamVideoContainer = document.querySelector('#webcam__video__container video');
    const _startPhaseTwoButton = document.querySelector('.start__button');
    const _phaseOneContainer = document.querySelector('#phase__1');
    const _phaseTwoContainer = document.querySelector('#phase__2');
    const _recordButtonsContainer = document.querySelector('.record__buttons__container');
    const _recordingTime = document.querySelector('.recording__time');

    displayCreateGifsSection();
    setPhaseOneEventListeners();

    function displayCreateGifsSection() {
        hideElementsDOM(elementsDOM.navRightContainer,
            elementsDOM.searchSection,
            elementsDOM.suggestionsContainer,
            elementsDOM.trendsContainer);

        showElementsDOM(elementsDOM.sectionGifsCreation,
            elementsDOM.sectionMyGifs,
            elementsDOM.arrowIcon);
    }

    function setPhaseOneEventListeners() {
        _startPhaseTwoButton.onclick = () => handlePhaseTwo();
    }

    function handlePhaseTwo() {
        displayPhaseTwo();
        getWebcamVideoStream();
        setPhaseTwoEventListeners();
    }

    function displayPhaseTwo() {
        hideElementsDOM(_phaseOneContainer);
        showElementsDOM(_phaseTwoContainer);
    }

    async function getWebcamVideoStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    height: {
                        max: 450
                    }
                },
                audio: false
            });
            _webcamVideoContainer.srcObject = stream;
        } catch (error) {
            console.error(error);
        }
    }

    function setPhaseTwoEventListeners() {
        _recordButtonsContainer.onclick = () => {
            displayRecordingButtons();
            startRecording();
        };
    }

    function displayRecordingButtons() {
        _recordButtonsContainer.classList.add('recording');
        document.querySelector('.capture__text').innerHTML = 'Listo';
        showElementsDOM(_recordingTime);
    }

    function startRecording() {
        console.log(_webcamVideoContainer.srcObject);
    }
}