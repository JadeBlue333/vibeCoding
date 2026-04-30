const STORAGE_KEY = "puppy-gallery-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const samplePhotos = [
  {
    id: "sample-park",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    caption: "Sunny walk, maximum tail wag",
    createdAt: "2026-04-28T09:30:00.000Z"
  },
  {
    id: "sample-nap",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
    caption: "Sleepy day after the park",
    createdAt: "2026-04-27T13:15:00.000Z"
  },
  {
    id: "sample-smile",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80",
    caption: "Tiny grin, big mood",
    createdAt: "2026-04-26T16:45:00.000Z"
  }
];

const gallery = document.querySelector("#gallery");
const emptyState = document.querySelector("#empty-state");
const uploadForm = document.querySelector("#upload-form");
const fileInput = document.querySelector("#photo-file");
const captionInput = document.querySelector("#caption");
const formMessage = document.querySelector("#form-message");
const resetSamplesButton = document.querySelector("#reset-samples");
const modal = document.querySelector("#photo-modal");
const modalImage = document.querySelector("#modal-image");
const modalCaption = document.querySelector("#modal-caption");
const modalDate = document.querySelector("#modal-date");
const closeModalButton = document.querySelector("#close-modal");

let photos = loadPhotos();

function loadPhotos() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    savePhotos(samplePhotos);
    return [...samplePhotos];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [...samplePhotos];
  } catch {
    return [...samplePhotos];
  }
}

function savePhotos(nextPhotos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPhotos));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function renderGallery() {
  const sortedPhotos = [...photos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  gallery.innerHTML = "";
  emptyState.hidden = sortedPhotos.length > 0;

  sortedPhotos.forEach((photo) => {
    const card = document.createElement("figure");
    card.className = "photo-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${photo.caption || "puppy photo"}`);

    const image = document.createElement("img");
    image.src = photo.imageUrl;
    image.alt = photo.caption || "Uploaded puppy photo";
    image.loading = "lazy";

    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    title.textContent = photo.caption || "Untitled puppy moment";
    const time = document.createElement("time");
    time.dateTime = photo.createdAt;
    time.textContent = formatDate(photo.createdAt);

    caption.append(title, time);
    card.append(image, caption);
    card.addEventListener("click", () => openPhoto(photo));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto(photo);
      }
    });

    gallery.append(card);
  });
}

function openPhoto(photo) {
  modalImage.src = photo.imageUrl;
  modalImage.alt = photo.caption || "Puppy photo detail";
  modalCaption.textContent = photo.caption || "Untitled puppy moment";
  modalDate.textContent = `Uploaded ${formatDate(photo.createdAt)}`;
  modal.showModal();
}

function setMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#b3261e" : "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read the selected file.")));
    reader.readAsDataURL(file);
  });
}

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];

  if (!file) {
    setMessage("Choose a puppy photo first.", true);
    return;
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    setMessage("Only JPG and PNG images are supported.", true);
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setMessage("Please choose an image smaller than 5MB.", true);
    return;
  }

  try {
    const imageUrl = await fileToDataUrl(file);
    const photo = {
      id: crypto.randomUUID(),
      imageUrl,
      caption: captionInput.value.trim(),
      createdAt: new Date().toISOString()
    };

    photos = [photo, ...photos];
    savePhotos(photos);
    renderGallery();
    uploadForm.reset();
    setMessage("Added to the gallery.");
  } catch (error) {
    setMessage(error.message, true);
  }
});

resetSamplesButton.addEventListener("click", () => {
  photos = [...samplePhotos];
  savePhotos(photos);
  renderGallery();
  setMessage("Sample photos restored.");
});

closeModalButton.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

renderGallery();
