/*  Created using ChatGPT, Gemini and Copilot November 2024 */


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

function clearContent(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '';
        }
    });
}

function createSubfolderListItem(folder, subfolder) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `subfolder.html?folder=${subfolder}/${folder}`;
    link.textContent = folder;
    link.dataset.type = 'folder'; // Mark as folder to exclude from modal
    listItem.appendChild(link);
    return listItem;
}



function createMiscListItem(file) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="${file.url}">${file.name}</a>`;
    return listItem;
}

let currentData; // Declare globally

async function loadSubfolderContents(subfolder) {
    try {
        console.log(`Fetching contents of subfolder: ${subfolder}`);
        const response = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${subfolder}`);
        if (!response.ok) {
            console.error("Failed to fetch subfolder contents:", response.status, response.statusText);
            return;
        }

        currentData = await response.json(); // Store in global variable
        console.log("Subfolder contents:", currentData);

        document.getElementById('subfolderName').textContent = subfolder;

        clearContent(['foldersList', 'videosList', 'imagesList', 'miscList']);

        const imagesList = document.getElementById('imagesList');
        const videosList = document.getElementById('videosList');

        // Populate images and videos from the thumbnail folder
        currentData.images.forEach((image, index) => {
            if (image.url.includes('/thumbnail/')) {
                const fullSizeUrl = image.url.replace('/thumbnail/', '/').replace('_tn.jpg', '.jpg');
                const listItem = createThumbnailItem(image.url, fullSizeUrl, index, 'image');
                imagesList.appendChild(listItem);
            }
        });

        currentData.videos.forEach((video, index) => {
            const thumbnailUrl = video.thumbnail_url;
            const fullImageUrl = thumbnailUrl.replace('_tn.jpg', '.jpg');
            const videoUrl = video.url.replace('_tn.jpg', '.mp4');
            const listItem = createThumbnailItem(thumbnailUrl, fullImageUrl, index, 'video', videoUrl);
            videosList.appendChild(listItem);
        });

        initPhotoSwipeFromDOM('#imagesSection, #videosSection');
    } catch (error) {
        console.error("Error loading subfolder contents:", error);
    }
}


// Helper function to create a thumbnail item
function createThumbnailItem(thumbnailUrl, fullUrl, index, type, videoUrl = null) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const img = document.createElement('img');
    img.src = thumbnailUrl;
    img.className = 'img-thumbnail file-thumbnail';
    img.alt = `Thumbnail ${index}`;
    img.dataset.type = type;
    img.dataset.index = index;

    if (type === 'video') {
        img.addEventListener('click', () => openVideoModal(fullUrl, videoUrl, index));
    } else {
        img.addEventListener('click', () => openImageModal(fullUrl, index));
    }

    col.appendChild(img);
    return col;
}

function getPreviewThumbnails(currentIndex, type, data) {
    const items = type === 'image' ? data.images : data.videos;
    return items
        .map((item, index) => {
            if (index === currentIndex) return ''; // Skip current item
            const thumbnailUrl = item.url.includes('/thumbnail/') ? item.url : item.thumbnail_url;
            const fullUrl = thumbnailUrl.replace('_tn.jpg', '.jpg');
            const videoUrl = type === 'video' ? fullUrl.replace('.jpg', '.mp4') : null;

            return `<img src="${thumbnailUrl}" class="preview-thumbnail" onclick="${
                type === 'video' ? `openVideoModal('${fullUrl}', '${videoUrl}', ${index})` : `openImageModal('${fullUrl}', ${index})`
            }">`;
        })
        .join('');
}



function openImageModal(imageUrl, currentIndex) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <img src="${imageUrl}" class="modal-file" alt="Full Image">
        <div class="image-previews mt-3">
            ${getPreviewThumbnails(currentIndex, 'image', currentData)}
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.show();
}

function openVideoModal(imageUrl, videoUrl, currentIndex) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <img src="${imageUrl}" class="modal-file" alt="Video Thumbnail">
        <button id="playButton" class="btn btn-primary mt-3">Play Video</button>
        <div class="image-previews mt-3">
            ${getPreviewThumbnails(currentIndex, 'video', currentData)}
        </div>
    `;

    const playButton = document.getElementById('playButton');
    playButton.addEventListener('click', () => {
        modalContent.innerHTML = `
            <video controls autoplay style="width:100%;">
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    });

    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.show();
}


// Generate video preview thumbnails
function getVideoPreviewThumbnails(currentIndex) {
    return data.videos
        .map((video, index) => {
            if (index === currentIndex) return ''; // Skip the current video
            const thumbnailUrl = video.thumbnail_url;
            return `<img src="${thumbnailUrl}" class="preview-thumbnail" onclick="openVideoModal('${video.url.replace('_tn', '')}', ${index})">`;
        })
        .join('');
}


function createImageItem(image, index) {
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

    return col;
}

function initPhotoSwipeFromDOM(gallerySelector) {
    const parseThumbnailElements = function (el) {
        const items = [];
        const thumbElements = el.querySelectorAll('a[data-type="image"], img[data-type="video"]');
    
        thumbElements.forEach((el, index) => { // Add 'index' here
            const item = {
                src: el.href || el.src,
                w: el.naturalWidth || 800, // Default width if not available
                h: el.naturalHeight || 600, // Default height if not available
                title: el.alt || '',
                msrc: el.querySelector('img') ? el.querySelector('img').src : el.src,
                el: el,
            };
    
            if (el.dataset.type === 'video') {
                item.html = `
                    <div style="text-align: center;">
                        <img src="${el.src}" class="modal-file" alt="Video">
                        <button id="playButton-${index}" class="btn btn-primary mt-3">Play Video</button>
                    </div>
                `;
            }
    
            items.push(item);
        });
    
        return items;
    };
    

    const openPhotoSwipe = function (index, galleryElement) {
        const pswpElement = document.querySelectorAll('.pswp')[0];
        const items = parseThumbnailElements(galleryElement);

        if (items.length === 0) {
            console.error("No items to display in PhotoSwipe");
            return;
        }

        const options = {
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),
            index: index,
            getThumbBoundsFn: (index) => {
                const thumbnail = items[index].el;
                const rect = thumbnail.getBoundingClientRect();
                const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
            },
        };

        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.listen('afterChange', function () {
            const currentIndex = gallery.getCurrentIndex();
            const currentItem = items[currentIndex];
            const playButton = document.getElementById(`playButton-${currentIndex}`);
            const videoElement = document.getElementById(`videoElement-${currentIndex}`);

            if (playButton && videoElement) {
                playButton.addEventListener('click', () => {
                    videoElement.play();
                });
            }
        });

        gallery.init();

    };

    const galleryElements = document.querySelectorAll(gallerySelector);

    galleryElements.forEach((galleryElement, galleryIndex) => {
        galleryElement.setAttribute('data-pswp-uid', galleryIndex + 1);

        galleryElement.querySelectorAll('img[data-type="video"], a[data-type="image"]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                openPhotoSwipe(parseInt(el.dataset.index, 10), galleryElement);
            });
        });
    });
}
