const api_key = "mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ";

// Toggles dropdown menu visibility 
document.querySelector('#dropdown-button').onclick = function (e) {
    e.preventDefault();
    const dropdownMenu = document.querySelector('#dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
};

// Closes the dropdown menu if the user click outside
document.onclick = function (e) {
    if (e.target === document.querySelector('body')) document.querySelector('#dropdown-menu').style.display = 'none';
};


// When window loads fetch gifs
window.onload = function () {
    fetchTrendingGifs();
    fetchTrendingSearches();
};

// Disables submit button if search bar is empty
document.querySelector('#search-input').oninput = (e) => {
    
    const searchButton = document.querySelector('#submit-btn');
    if (e.target.value === '') {
        searchButton.disabled = true;
    } else {
        searchButton.disabled = false;
    }
};

function fetchTrendingGifs(limit = 20) {
    fetch(`http://api.giphy.com/v1/gifs/trending?api_key=${api_key}&limit=${limit}&rating=pg-13&offset=${Math.floor(Math.random()*300)}`)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(gif => {
                let gifClass;
                gifClass = gif.images["480w_still"].width / gif.images["480w_still"].height >= 1.5 ? 'double' : '';
                trendGifContainer = document.querySelector(".trends-gifs-container");
                insertGifToDOM(trendGifContainer, gif, 'trending', gifClass);
            });
        }).catch(error => {
            return error;
        });
}

function fetchTrendingSearches() {
    fetch(`http://api.giphy.com/v1/trending/searches?api_key=${api_key}`)
        .then(response => response.json())
        .then(data => {
            fetchSuggestedGifs(data.data);
        }).catch(error => {
            return error;
        });
}

function fetchSuggestedGifs(searches) {
    const searchTag = searches[Math.floor(Math.random() * searches.length)];
    fetch(`http://api.giphy.com/v1/gifs/search?q=${searchTag}&api_key=${api_key}&limit=${'4'}&rating=pg-13`)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(gif => {
                suggestedGifsContainer = document.querySelector(".suggested-gifs-container");
                insertGifToDOM(suggestedGifsContainer, gif, 'suggested');
            });
        });
}

function insertGifToDOM(domElement, gif, gifType, gifClass = '') {

    let gifHeader = gifType === 'suggested' 
    ? `<div class="gif-header-container">
           <span>${gif.title.length > 37 ? gif.title.slice(0,37) + '...' : gif.title}</span>
           <img class="button-close" src="./assets//icons/button close.svg" alt="">
       </div>`
     : '';

    let gifFooter = gifType === 'trending' ?
         `<div class="gif-footer-container">
            <span>${gif.title.split(" ").map(el => el = "#" + el).join(" ")}</span>
          </div>` :
         '';
    let button = gifType === 'suggested' ? `<a class="tag" href="${gif.bitly_url}">Ver más...</a>` : '';

    const newGifHTML = `<div class="gif-container ${gifType} ${gifClass}">
                            ${gifHeader}
                            <div class="gif-bottom-container">
                                <img class="gif-image" src="${gif.images.original.url}"/>
                                ${button}
                                ${gifFooter}
                            </div>
                        </div>`;

    domElement.insertAdjacentHTML('beforeend', newGifHTML);
}

//37