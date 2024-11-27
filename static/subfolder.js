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

// Initialize GLightbox
function initializeGLightbox() {
    const lightbox = GLightbox({
        selector: '.glightbox', // Target all anchor elements with this class
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
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

async function loadSubfolderContents(subfolder) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block'; // Show loading indicator

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
        const foldersList = document.getElementById('foldersList');
        const videosList = document.getElementById('videosList');

        // Populate folders
        data.folders.forEach(folder => {
            if (folder !== "thumbnail" && folder !== "tn") {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `subfolder.html?folder=${subfolder}/${folder}`;
                link.textContent = folder;
                listItem.appendChild(link);
                foldersList.appendChild(listItem);
            }
        });

        // Populate images
        data.images.forEach((image) => {
            const isThumbnail = image.url.includes('/thumbnail/');
            const thumbnailUrl = image.url;
            const fullSizeUrl = isThumbnail
                ? image.url.replace('/thumbnail/', '/').replace('_tn.jpg', '.jpg')
                : image.url;

            const listItem = createGLightboxItem(thumbnailUrl, fullSizeUrl, 'image');
            imagesList.appendChild(listItem);
        });
        console.log("Images data:", data.images);

        // Populate videos
        data.videos.forEach(video => {
            const thumbnailUrl = video.thumbnail_url || `${video.url.replace('.mp4', '.mp4_tn.jpg')}`;
            const fullImageUrl = video.url.replace('.mp4', '.mp4.jpg');
            const videoUrl = video.url;

            const listItem = createGLightboxItem(thumbnailUrl, videoUrl, 'video');
            videosList.appendChild(listItem);
        });

        // Handle empty folder
        if (!data.images.length && !data.videos.length && !data.folders.length) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = "This folder is empty.";
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.marginTop = '20px';
            document.querySelector('.container').appendChild(emptyMessage);
        }

        initializeGLightbox(); // Reinitialize GLightbox
    } catch (error) {
        console.error("Error loading subfolder contents:", error);
    } finally {
        loadingIndicator.style.display = 'none'; // Hide loading indicator
    }
}



function createGLightboxItem(thumbnailUrl, fullUrl, type) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const a = document.createElement('a');
    a.href = fullUrl;
    a.className = 'glightbox';

    if (type === 'video') {
        a.dataset.type = 'video'; // Specify that this is a video
        const playButton = document.createElement('div');
        playButton.className = 'play-button'; // Add a play button overlay
        playButton.textContent = '▶'; // Play symbol
        a.appendChild(playButton);
    }

    const img = document.createElement('img');
    img.src = thumbnailUrl;
    img.className = 'img-thumbnail file-thumbnail';
    img.alt = "Thumbnail";

    a.appendChild(img);
    col.appendChild(a);
    return col;
}
