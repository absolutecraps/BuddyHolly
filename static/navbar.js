async function loadNavbar() {
    try {
        console.log("Fetching navbar.html...");
        const response = await fetch('navbar.html');
        if (!response.ok) {
            console.error("Failed to fetch navbar.html:", response.status, response.statusText);
            return;
        }
        const navbarHtml = await response.text();
        document.getElementById('navbar').innerHTML = navbarHtml;

        // Populate navbar folders
        await populateNavbarFolders();
    } catch (error) {
        console.error("Error loading navbar:", error);
    }
}

async function populateNavbarFolders() {
    try {
        console.log("Fetching top-level folders for navbar...");
        const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
        if (!response.ok) {
            console.error("Failed to fetch folders for navbar:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Top-level folders fetched for navbar:", data.folders);
        const folderMenu = document.getElementById('folderMenu');
        folderMenu.innerHTML = ''; // Clear existing content

        // Populate navbar with top-level folders
        data.folders.forEach(folder => {
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            const link = document.createElement('a');
            link.className = 'nav-link';
            link.href = `subfolder.html?folder=${folder}`;
            link.textContent = folder;
            navItem.appendChild(link);
            folderMenu.appendChild(navItem);
        });
    } catch (error) {
        console.error("Error populating navbar folders:", error);
    }
}

// Initialize the navbar on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing navbar...");
    await loadNavbar();
});
