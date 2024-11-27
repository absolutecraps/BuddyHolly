async function loadNavbar() {
    const response = await fetch('navbar.html');
    const navbarHtml = await response.text();
    document.getElementById('navbar').innerHTML = navbarHtml;
    await populateNavbarFolders();
}

async function populateNavbarFolders() {
    const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
    const data = await response.json();
    const folderMenu = document.getElementById('folderMenu');
    folderMenu.innerHTML = '';
    data.folders.forEach(folder => {
        const navItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `subfolder.html?folder=${folder}`;
        link.textContent = folder;
        navItem.appendChild(link);
        folderMenu.appendChild(navItem);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadNavbar();
    const contentList = document.getElementById('contentList');
    const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
    const data = await response.json();
    data.folders.forEach(folder => {
        const item = document.createElement('li');
        item.innerHTML = `<a href="subfolder.html?folder=${folder}">${folder}</a>`;
        contentList.appendChild(item);
    });
});
