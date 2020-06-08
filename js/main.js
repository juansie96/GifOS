const api_key = "mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ";

const showElementsDOM = (...elements) => {
    elements.forEach(element => element.classList.remove('hidden'));
};

const hideElementsDOM = (...elements) => {
    elements.forEach(element => element.classList.add('hidden'));
};

// Toggle del menu dropdown para cambiar de tema
document.querySelector('#dropdown-button').onclick = function (e) {
    e.preventDefault();
    const dropdownMenu = document.querySelector('#dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
};

// Cierra el dropdown de temas si el usuario clickea afuera
document.onclick = function (e) {
    if (e.target === document.querySelector('body')) document.querySelector('#dropdown-menu').style.display = 'none';
};


window.onload = function () {
    fetchTrendingGifs();
    fetchTrendingSearches();
};

document.querySelector('#search-input').oninput = (e) => {

    const suggestionsContainer = document.querySelector('.suggestions-container');
    const searchButton = document.querySelector('#submit-btn');

    // Si el search input esta vacio oculta el contenedor de sugerencias
    if (e.target.value === '') {
        searchButton.disabled = true;
        hideElementsDOM(suggestionsContainer);
    // Si el usuario escribió algo, muestra el contenedor de sugerencias y se llama a la API para renderizar las sugerencias
    } else {
        searchButton.disabled = false;
        showElementsDOM(suggestionsContainer);
        getSearchSuggestions(e.target.value);
    }
};

async function fetchTrendingGifs(limit = 20) {
    try {
        const url = `http://api.giphy.com/v1/gifs/trending?api_key=${api_key}&limit=${limit}&rating=pg-13&offset=${Math.floor(Math.random()*300)}`;
        const response = await fetch(url);
        const data = await response.json();
        // Llamo a función para renderizar los gifs en el DOM
        renderTrendingGifs(data.data);
    } catch(error) {
        console.error(error);
    }
}

function renderTrendingGifs(gifs) {
    gifs.forEach(gif => {
        let gifClass;
        // Si la proporcion del gif es ancha entonces le asignamos la clase 'double' para que ocupe 2 casillas en el GRID
        gifClass = gif.images["480w_still"].width / gif.images["480w_still"].height >= 1.5 ? 'double' : '';
        trendGifContainer = document.querySelector(".trends-gifs-container");
        insertGifToDOM(gif, 'trending', gifClass);
    });
}

// Esta función va a traer las búsquedas populares sugeridas (Strings) para luego traer gifs sugeridos
async function fetchTrendingSearches() {
     try { 
        const url = `http://api.giphy.com/v1/trending/searches?api_key=${api_key}`;
        const response = await fetch(url);
        const data = await response.json();
        fetchSuggestedGifs(data.data); // Llamo a fetchSuggestedGifs para que traiga gifs sugeridos en base a las busquedas populares
    } catch (error) {
        console.error(error);
    }
}

// Esta función va a traer los gifs sugeridos de nuestra página 
async function fetchSuggestedGifs(searches) {
    try {
        // De el array de búsquedas populares, selecciona uno al azar
        const searchTag = searches[Math.floor(Math.random() * searches.length)];
        // Hacemos una query a la API para que traiga los gifs con la busqueda popular seleccionada
        const url = `http://api.giphy.com/v1/gifs/search?q=${searchTag}&api_key=${api_key}&limit=${'4'}&rating=pg-13`;
        const response = await fetch(url);
        const data = await response.json();

        // Inserta al DOM cada uno de los gifs devueltos
        data.data.forEach(gif => insertGifToDOM(gif, 'suggested'));
    } catch (error) {
        console.error(error);
    }
}

async function getSearchSuggestions(input) {
    try {
        const url = `http://api.giphy.com/v1/gifs/search/tags?q=${input}&api_key=${api_key}`;
        const response = await fetch(url);
        const data = await response.json();
        renderSearchSuggestions(data.data);
    } catch(error)  {
        console.error(error);
    }
}

function renderSearchSuggestions(suggestions) {
    const suggestionsContainer = document.querySelector('.suggestions-container');
    suggestionsContainer.innerHTML = '';
    let newSuggestionHTML;
    suggestions.forEach(suggestion => {
        newSuggestionHTML = `<button class="suggestion">
                                <span>${suggestion.name}</span>
                             </button>`;
        suggestionsContainer.insertAdjacentHTML('beforeend', newSuggestionHTML);
    });
}

function insertGifToDOM(gif, gifType, gifClass = '') {

    switch (gifType) {

        case 'suggested':
            // Si el titulo del gif es muy largo evita el salto de linea agregando ... al final de la primera linea
            const gifTitle = gif.title.length > 37 ? gif.title.slice(0, 37) + '...' : gif.title;
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

            document.querySelector(".suggested-gifs-container").insertAdjacentHTML('beforeend', suggestedGifHTML);
            break;
        
        case 'trending':
            // Agrega un hash # al comienzo de cada palabra del titulo
            const hashedTitle = gif.title.split(" ").map(el => el = "#" + el).join(" ");
            gifFooter = `<div class="gif-footer-container">
                            <span>${hashedTitle}</span>
                    </div>`;

            const trendingGifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                                        <div class="gif-bottom-container">
                                             <img class="gif-image" src="${gif.images.original.url}"/>
                                            ${gifFooter}
                                        </div>
                                    </div>`;

            document.querySelector(".trending-gifs-container").insertAdjacentHTML('beforeend', trendingGifHTML);
            break;
        default:
    }

    
}

