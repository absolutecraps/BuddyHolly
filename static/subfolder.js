/*  Created using ChatGPT, Gemini and Copilot November 2024 */

/* Updated subfolder.js including navbar loading and PhotoSwipe integration */

let currentData; // Global variable to store current folder data

// Load the navbar dynamically
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
    } catch (error) {
        console.error("Error fetching navbar.html:", error);
    }
}

async function loadSubfolderContents(subfolder) {
    try {
        console.log(`Fetching contents of subfolder: ${subfolder}`);
        const response = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${subfolder}`);
        if (!response.ok) {
            console.error("Failed to fetch subfolder contents:", response.status, response.statusText);
            return;
        }

        currentData = await response.json();
        console.log("Subfolder contents:", currentData);

        document.getElementById('subfolderName').textContent = subfolder;
        clearContent(['foldersList', 'videosList', 'imagesList', 'miscList']);

        const imagesList = document.getElementById('imagesList');
        const videosList = document.getElementById('videosList');

        // Populate images and videos
        currentData.images.forEach((image, index) => {
            if (image.url.includes('/thumbnail/')) {
                const fullSizeUrl = image.url.replace('/thumbnail/', '/').replace('_tn.jpg', '.jpg');
                const listItem = createPhotoSwipeItem(image.url, fullSizeUrl, index, 'image');
                imagesList.appendChild(listItem);
            }
        });

        currentData.videos.forEach((video, index) => {
            const thumbnailUrl = video.thumbnail_url;
            const fullImageUrl = thumbnailUrl.replace('_tn.jpg', '.jpg');
            const videoUrl = video.url.replace('_tn.jpg', '.mp4');
            const listItem = createPhotoSwipeItem(thumbnailUrl, fullImageUrl, index, 'video', videoUrl);
            videosList.appendChild(listItem);
        });

        initPhotoSwipeFromDOM('.pswp');
    } catch (error) {
        console.error("Error loading subfolder contents:", error);
    }
}

function createPhotoSwipeItem(thumbnailUrl, fullUrl, index, type, videoUrl = null) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const a = document.createElement('a');
    a.href = fullUrl;
    a.dataset.size = '1920x1080';
    a.dataset.type = type;
    a.dataset.index = index;

    if (videoUrl) {
        a.dataset.video = videoUrl;
    }

    const img = document.createElement('img');
    img.src = thumbnailUrl;
    img.className = 'img-thumbnail file-thumbnail';
    img.alt = `Thumbnail ${index}`;

    a.appendChild(img);
    col.appendChild(a);
    return col;
}

function getPreviewThumbnails(currentIndex, type) {
    const items = type === 'image' ? currentData.images : currentData.videos;
    return items
        .map((item, index) => {
            if (index === currentIndex) return '';
            const thumbnailUrl = item.url.includes('/thumbnail/') ? item.url : item.thumbnail_url;
            const fullUrl = thumbnailUrl.replace('_tn.jpg', '.jpg');
            const videoUrl = type === 'video' ? fullUrl.replace('.jpg', '.mp4') : null;

            return `<img src="${thumbnailUrl}" class="preview-thumbnail" onclick="${
                type === 'video' ? `openVideoModal('${fullUrl}', '${videoUrl}', ${index})` : `openImageModal('${fullUrl}', ${index})`
            }">`;
        })
        .join('');
}

function initPhotoSwipeFromDOM(gallerySelector) {
    const parseThumbnailElements = function (el) {
        const items = [];
        const links = el.querySelectorAll('a');

        links.forEach((link) => {
            const item = {
                src: link.href,
                w: 1920,
                h: 1080,
                title: link.querySelector('img').alt || '',
                msrc: link.querySelector('img').src,
                el: link,
            };

            if (link.dataset.type === 'video') {
                item.video = link.dataset.video;
            }

            items.push(item);
        });

        return items;
    };

    const openPhotoSwipe = function (index, galleryElement) {
        const pswpElement = document.querySelectorAll('.pswp')[0];
        const items = parseThumbnailElements(galleryElement);
        const options = {
            index: index,
            getThumbBoundsFn: (index) => {
                const thumbnail = items[index].el.querySelector('img');
                const rect = thumbnail.getBoundingClientRect();
                const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
            },
        };

        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.listen('afterChange', function () {
            const currentIndex = gallery.getCurrentIndex();
            const currentItem = items[currentIndex];
            if (currentItem.video) {
                const modalContent = document.querySelector('.pswp__container');
                modalContent.innerHTML = `
                    <video controls autoplay style="width:100%;">
                        <source src="${currentItem.video}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }
        });

        gallery.init();
    };

    const galleryElements = document.querySelectorAll(gallerySelector);

    galleryElements.forEach((galleryElement, galleryIndex) => {
        galleryElement.setAttribute('data-pswp-uid', galleryIndex + 1);

        galleryElement.querySelectorAll('a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPhotoSwipe(index, galleryElement);
            });
        });
    });
}

// Clear content of specified elements
function clearContent(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '';
        }
    });
}

// Load the navbar and initialize subfolder contents
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing subfolder page...");
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
