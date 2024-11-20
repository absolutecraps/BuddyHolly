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
    console.log("Fetching top-level folders for navbar...");
    try {
        const response = await fetch('https://media-gallery.justsoicanpostheretoday.workers.dev/files/');
        if (!response.ok) {
            console.error("Failed to fetch folders for navbar:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Top-level folders fetched for navbar:", data.folders);
        const folderMenu = document.getElementById('folderMenu');

        // Clear existing content in the folderMenu (if any)
        folderMenu.innerHTML = '';

        // Populate top-level folders in the navbar menu
        for (const folder of data.folders) {
            console.log(`Processing folder for navbar: ${folder}`);
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

            try {
                const subfolderResponse = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${folder}`);
                if (!subfolderResponse.ok) {
                    console.error(`Failed to fetch subfolders for ${folder}:`, subfolderResponse.status, subfolderResponse.statusText);
                    continue; // Skip this folder and move to the next
                }

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
            } catch (subfolderError) {
                console.error(`Error fetching subfolders for ${folder}:`, subfolderError);
            }

            navItem.appendChild(navLink);
            navItem.appendChild(dropdownMenu);
            folderMenu.appendChild(navItem);
        }

        console.log("Navbar populated successfully");
    } catch (error) {
        console.error("Error fetching folders for navbar:", error);
    }
}

async function loadSubfolderContents(subfolder) {
    try {
        console.log("Fetching subfolder contents...");
        const response = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${subfolder}`);
        if (!response.ok) {
            console.error("Failed to fetch subfolder contents:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Subfolder contents fetched:", data);

        document.getElementById('subfolderName').innerText = subfolder;

        // Populate folders section
        const foldersList = document.getElementById('foldersList');
        let hasSubfolders = false;
        data.folders.forEach(folder => {
            if (folder !== "thumbnail" && folder !== "tn") {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="subfolder.html?folder=${subfolder}/${folder}">${folder}</a>`;
                foldersList.appendChild(listItem);
                hasSubfolders = true;
            }
        });
        if (hasSubfolders) {
            document.getElementById('foldersSection').style.display = 'block';
        }

        // Populate videos section
        const videosList = document.getElementById('videosList');
        if (data.videos.length > 0) {
            data.videos.forEach(video => {
                const col = document.createElement('div');
                col.className = 'col-md-4';

                // Use full-sized thumbnail for display
                const imgName = video.thumbnail_url.split('/').pop();
                const fullThumbnailUrl = video.thumbnail_url.replace('_tn', '');

                const img = document.createElement('img');
                img.src = fullThumbnailUrl;
                img.className = 'img-thumbnail file-thumbnail';
                img.alt = imgName;
                img.onerror = () => { // Handle missing thumbnails
                    console.error(`Thumbnail not found: ${fullThumbnailUrl}`);
                    img.src = video.thumbnail_url; // Fall back to original thumbnail if full thumbnail is missing
                };
                img.dataset.bsToggle = 'modal';
                img.dataset.bsTarget = '#fileModal';
                img.addEventListener('click', () => {
                    document.getElementById('modalContent').innerHTML = `
                        <img src="${fullThumbnailUrl}" class="modal-file" alt="Video Thumbnail">
                        <button id="playButton" class="btn btn-primary mt-2">Play</button>
                    `;
                    document.getElementById('playButton').addEventListener('click', () => {
                        document.getElementById('modalContent').innerHTML = `
                            <video controls class="modal-file">
                                <source src="${video.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;
                    });
                });
                col.appendChild(img);
                videosList.appendChild(col);
            });
            document.getElementById('videosSection').style.display = 'block';
        }

        // Populate images section
        const imagesList = document.getElementById('imagesList');
        const validImages = data.images.filter(image => !image.url.includes('mp4')).sort((a, b) => a.url.localeCompare(b.url));
        if (validImages.length > 0) {
            validImages.forEach((image, index) => {
                const col = document.createElement('div');
                col.className = 'col-md-4';

                // Use thumbnail for display
                const imgName = image.url.split('/').pop();
                const thumbnailUrl = `${image.url.split('/').slice(0, -1).join('/')}/thumbnail/${imgName.replace('.jpg', '_tn.jpg')}`;
                
                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.className = 'img-thumbnail file-thumbnail';
                img.alt = imgName; // Add alt attribute for accessibility
                img.onerror = () => { // Handle missing thumbnails
                    console.error(`Thumbnail not found: ${thumbnailUrl}`);
                    img.src = image.url; // Fall back to full image if thumbnail is missing
                };
                img.dataset.bsToggle = 'modal';
                img.dataset.bsTarget = '#fileModal';
                img.dataset.index = index;
                img.addEventListener('click', () => openImageModal(index, validImages));
                col.appendChild(img);
                imagesList.appendChild(col);
            });
            document.getElementById('imagesSection').style.display = 'block';
        }

        // Populate miscellaneous files section
        const miscList = document.getElementById('miscList');
        if (data.misc.length > 0) {
            data.misc.forEach(file => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<a href="${file.url}">${file.name}</a>`;
                miscList.appendChild(listItem);
            });
            document.getElementById('miscSection').style.display = 'block';
        }

        console.log("Subfolder contents populated successfully");
    } catch (error) {
        console.error("Error fetching subfolder contents:", error);
    }
}

function openImageModal(index, images) {
    const image = images[index];
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <img src="${image.url}" class="modal-file" style="width: 100%; height: auto;" alt="Image">
        <div class="image-previews mt-3">
            ${getPreviewThumbnails(index, images)}
        </div>
    `;

    // Add zoom functionality
    addZoomFunctionality();

    // Scroll and drag functionality
    const modalFile = document.querySelector('.modal-file');
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    modalFile.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - modalFile.offsetLeft;
        startY = e.pageY - modalFile.offsetTop;
        scrollLeft = modalFile.scrollLeft;
        scrollTop = modalFile.scrollTop;
    });

    modalFile.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    modalFile.addEventListener('mouseup', () => {
        isDragging = false;
    });

    modalFile.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - modalFile.offsetLeft;
        const y = e.pageY - modalFile.offsetTop;
        const walkX = (x - startX) * 2;
        const walkY = (y - startY) * 2;
        modalFile.scrollLeft = scrollLeft - walkX;
        modalFile.scrollTop = scrollTop - walkY;
    });
}



function addZoomFunctionality() {
    const modalFile = document.querySelector('.modal-file');
    let scale = 1;
    modalFile.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            scale += 0.1;
        } else {
            scale -= 0.1;
        }
        scale = Math.min(Math.max(0.5, scale), 3); // Limit zoom to between 0.5x and 3x
        modalFile.style.transform = `scale(${scale})`;
        modalFile.style.transformOrigin = 'center'; // Ensure zoom happens from the center
    });
}


function getPreviewThumbnails(index, images) {
    const previews = [];
    const start = Math.max(0, index - 5);
    const end = Math.min(images.length, index + 6);
    for (let i = start; i < end; i++) {
        if (i !== index) {
            previews.push(`
                <img src="${images[i].thumbnail_url}" class="preview-thumbnail" alt="Preview Image" onclick="openImageModal(${i}, ${JSON.stringify(images)})">
            `);
        }
    }
    return previews.join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Loading subfolder page...");
    await loadNavbar();

    const urlParams = new URLSearchParams(window.location.search);
    const subfolder = urlParams.get('folder');
    if (subfolder) {
        console.log(`Subfolder parameter found: ${subfolder}`);
        await loadSubfolderContents(subfolder);
    } else {
        console.error('No subfolder specified in the URL');
    }
});