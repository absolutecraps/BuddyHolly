document.addEventListener('DOMContentLoaded', async () => {
        console.log("Fetching top-level folders...");
        try {
            const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
            if (!response.ok) {
                console.error("Failed to fetch folders:", response.status, response.statusText);
                return;
            }

            const data = await response.json();
            const folderMenu = document.getElementById('folderMenu');
            console.log("Top-level folders fetched successfully:", data.folders);

            // Clear existing content in the folderMenu (if any)
            folderMenu.innerHTML = '';

            // Populate top-level folders in the navbar menu
            for (const folder of data.folders) {
                console.log(`Processing folder: ${folder}`);
                const navItem = document.createElement('li');
                navItem.className = 'nav-item dropdown';

                const navLink = document.createElement('a');
                navLink.className = 'nav-link dropdown-toggle';
                navLink.href = `#`;
                navLink.id = `navbarDropdown${folder}`;
                navLink.role = 'button';
                navLink.setAttribute('data-bs-toggle', 'dropdown');
                navLink.innerText = folder;

                const dropdownMenu = document.createElement('ul');
                dropdownMenu.className = 'dropdown-menu';

                const subfolderResponse = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${folder}`);
                const subfolderData = await subfolderResponse.json();
                console.log(`Subfolders for ${folder} fetched successfully:`, subfolderData.folders);

                subfolderData.folders.forEach(subfolder => {
                    const dropdownItem = document.createElement('li');
                    const subfolderLink = document.createElement('a');
                    subfolderLink.className = 'dropdown-item';
                    subfolderLink.href = `subfolder.html?folder=${folder}/${subfolder}`;
                    subfolderLink.innerText = subfolder;
                    dropdownItem.appendChild(subfolderLink);
                    dropdownMenu.appendChild(dropdownItem);
                });

                navItem.appendChild(navLink);
                navItem.appendChild(dropdownMenu);
                folderMenu.appendChild(navItem);
            }

            console.log("Navbar populated successfully");
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    });

// Show or hide the loading indicator
function setLoadingIndicator(visible) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = visible ? 'block' : 'none';
    }
}
