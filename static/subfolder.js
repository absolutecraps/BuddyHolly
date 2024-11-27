/*  Created using ChatGPT, Gemini, and Copilot - November 2024 */

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

// Initialize GLightbox
function initializeGLightbox() {
    const lightbox = GLightbox({
        selector: '.glightbox', // Target all anchor elements with this class
        touchNavigation: true, // Enable touch navigation
        loop: true, // Loop through all items
        autoplayVideos: true, // Automatically play videos
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

// Function to load subfolder contents
async function loadSubfolderContents(subfolder) {
    setLoadingIndicator(true); // Show loading indicator

    try {
        console.log(`Fetching contents of subfolder: ${subfolder}`);
        const response = await fetch(`https://media-gallery.justsoicanpostheretoday.workers.dev/files/${subfolder}`);
        if (!response.ok) {
            console.error("Failed to fetch subfolder contents:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log("Subfolder contents:", data);

        document.getElementById('subfolderName').textContent = subfolder;
        clearContent(['foldersList', 'videosList', 'imagesList', 'miscList']);

        const imagesList = document.getElementById('imagesList');
        const videosList = document.getElementById('videosList');

        // Populate images
        data.images.forEach((image, index) => {
            if (image.url.includes('/thumbnail/')) {
                const fullSizeUrl = image.url.replace('/thumbnail/', '/').replace('_tn.jpg', '.jpg');
                const listItem = createGLightboxItem(image.url, fullSizeUrl, 'image');
                imagesList.appendChild(listItem);
            }
        });

        // Populate videos
        data.videos.forEach((video, index) => {
            const thumbnailUrl = video.thumbnail_url;
            const fullImageUrl = thumbnailUrl.replace('_tn.jpg', '.jpg');
            const videoUrl = video.url.replace('_tn.jpg', '.mp4');
            const listItem = createGLightboxItem(thumbnailUrl, videoUrl, 'video');
            videosList.appendChild(listItem);
        });

        // Display message if folder is empty
        if (data.images.length === 0 && data.videos.length === 0) {
            const container = document.querySelector('.container');
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = "This folder is empty.";
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.marginTop = '20px';
            container.appendChild(emptyMessage);
        }

        initializeGLightbox(); // Reinitialize GLightbox after adding new items
    } catch (error) {
        console.error("Error loading subfolder contents:", error);
    } finally {
        setLoadingIndicator(false); // Hide loading indicator
    }
}

// Function to create GLightbox-compatible items
function createGLightboxItem(thumbnailUrl, fullUrl, type) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const a = document.createElement('a');
    a.href = fullUrl;
    a.className = 'glightbox'; // Required class for GLightbox

    if (type === 'video') {
        a.dataset.type = 'video'; // Specify that this is a video
    }

    const img = document.createElement('img');
    img.src = thumbnailUrl;
    img.className = 'img-thumbnail file-thumbnail';
    img.alt = "Thumbnail";

    a.appendChild(img);
    col.appendChild(a);
    return col;
}


// Show or hide the loading indicator
function setLoadingIndicator(visible) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = visible ? 'block' : 'none';
    }
}

