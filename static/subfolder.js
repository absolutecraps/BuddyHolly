/*  Created using ChatGPT, Gemini and Copilot Novemeber 2024 */


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

        const videosList = document.getElementById('videosList');
        if (data.videos.length > 0) {
            data.videos.forEach((video, index) => {
                const col = document.createElement('div');
                col.className = 'col-md-4';

                const imgName = video.thumbnail_url.split('/').pop();
                const fullThumbnailUrl = video.thumbnail_url.replace('_tn', '.jpg');

                const img = document.createElement('img');
                img.src = fullThumbnailUrl;
                img.className = 'img-thumbnail file-thumbnail';
                img.alt = imgName;
                img.onerror = () => {
                    console.error(`Thumbnail not found: ${fullThumbnailUrl}`);
                    img.src = video.thumbnail_url;
                };
                img.dataset.index = index;
                img.dataset.type = 'video';
                col.appendChild(img);
                videosList.appendChild(col);
            });
            document.getElementById('videosSection').style.display = 'block';
        }

        const imagesList = document.getElementById('imagesList');
        const validImages = data.images.filter(image => !image.url.includes('mp4')).sort((a, b) => a.url.localeCompare(b.url));
        if (validImages.length > 0) {
            validImages.forEach((image, index) => {
                const col = document.createElement('div');
                col.className = 'col-md-4';

                const imgName = image.url.split('/').pop();
                const thumbnailUrl = `${image.url.split('/').slice(0, -1).join('/')}/thumbnail/${imgName.replace('.jpg', '_tn.jpg')}`;

                const a = document.createElement('a');
                a.href = image.url;
                a.dataset.type = 'image';
                a.dataset.index = index;

                const img = document.createElement('img');
                img.src = thumbnailUrl;
                img.className = 'img-thumbnail file-thumbnail';
                img.alt = imgName;
                img.onerror = () => {
                    console.error(`Thumbnail not found: ${thumbnailUrl}`);
                    img.src = image.url;
                };

                a.appendChild(img);
                col.appendChild(a);
                imagesList.appendChild(col);
            });
            document.getElementById('imagesSection').style.display = 'block';
        }

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

        // Initialize Photoswipe
        initPhotoSwipeFromDOM('.container');
    } catch (error) {
        console.error("Error fetching subfolder contents:", error);
    }
}

function initPhotoSwipeFromDOM(gallerySelector) {
    const parseThumbnailElements = function(el) {
        const items = [];
        const thumbElements = el.querySelectorAll('a[data-type="image"], img[data-type="video"]');

        thumbElements.forEach((el, index) => {
            const item = {
                src: el.href || el.src,
                w: el.naturalWidth || 800, // default width
                h: el.naturalHeight || 600, // default height
                title: el.alt || '',
                msrc: el.querySelector('img').src,
                el: el
            };

            if (el.dataset.type === 'video') {
                item.html = `
                    <video controls style="width:100%; height:100%;">
                        <source src="${el.src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }

            items.push(item);
        });

        return items;
    };

    const openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        const pswpElement = document.querySelectorAll('.pswp')[0];
        const items = parseThumbnailElements(galleryElement);
        const options = {
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),
            index: index
        };

        // Pass data to PhotoSwipe and initialize it
        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    const galleryElements = document.querySelectorAll(gallerySelector);

    galleryElements.forEach((galleryElement, galleryIndex) => {
        galleryElement.setAttribute('data-pswp-uid', galleryIndex + 1);
        galleryElement.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
                e.preventDefault();
                openPhotoSwipe(parseInt(e.target.dataset.index, 10), galleryElement);
            }
        });
    });
}
