document.querySelector('#dropdown-button').onclick = function (e) {
        e.preventDefault();
        const dropdownMenu = document.querySelector('#dropdown-menu');
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    };