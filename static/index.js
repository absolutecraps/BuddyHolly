async function loadNavbar() {
            try {
                console.log("Fetching navbar.html...");
                const response = await fetch('navbar.html');
                if (!response.ok) {
                    console.error("Failed to fetch navbar.html:", response.status, response.statusText);
                    return;
                }
                const navbarHtml = await response.text();
                console.log("Navbar HTML fetched successfully");
                document.getElementById('navbar').innerHTML = navbarHtml;

                // Execute the script to fetch and populate folders
                await populateNavbarFolders();
            } catch (error) {
                console.error("Error fetching navbar.html:", error);
            }
        }

        async function populateNavbarFolders() {
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
                data.folders.forEach(folder => {
                    console.log(`Processing folder: ${folder}`);
                    const navItem = document.createElement('li');
                    navItem.className = 'nav-item dropdown';

                    const navLink = document.createElement('a');
                    navLink.className = 'nav-link';
                    navLink.href = `subfolder.html?folder=${folder}`;
                    navLink.innerText = folder;

                    navItem.appendChild(navLink);
                    folderMenu.appendChild(navItem);
                });

                console.log("Navbar populated successfully");
            } catch (error) {
                console.error("Error fetching folders:", error);
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            await loadNavbar();

            // Populate content list
            console.log("Fetching top-level folders and files...");
            const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
            if (!response.ok) {
                console.error("Failed to fetch top-level folders and files:", response.status, response.statusText);
                return;
            }

            const data = await response.json();
            console.log("Top-level folders and files fetched successfully:", data);

            const contentList = document.getElementById('contentList');

            // Populate top-level folders and files in the landing page list
            data.folders.forEach(folder => {
                const listItem = document.createElement('li');
                listItem.className = 'mb-3';
                listItem.innerHTML = `<a href="subfolder.html?folder=${folder}"><strong>${folder}</strong></a>`;
                contentList.appendChild(listItem);
            });

            // Populate top-level files in the landing page list
            data.misc.forEach(file => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="${file.url}">${file.name}</a>`;
                contentList.appendChild(listItem);
            });
        });